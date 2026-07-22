import { generateText, Output } from "ai"
import model from "./utils/model"
import { createSession } from "./utils/browserSession"
import { workflow } from "./data/workflow"

import { CollapsiblesSchema, fieldsSchema } from "./schemas"
import { tokensCounter } from "./utils/tokensConsumption"

type CollapsiblesType = {
    collapsibles: {
        collapsibleName: string
        collapsed: boolean
    }[]
}

type fieldsType = {
    fields: {
        formFieldName: string
        workflowFieldName: string
        value: string
    }[]
}

async function main() {
    console.log("Querying agent...")

    const counter = new tokensCounter()

    // STEP 1 - Go to website's URL
    const {text: websiteURLResponseText, usage: websiteURLUsage} = await generateText({
        model,
        prompt:`
            Here's a workflow:
            ${workflow}
            Return only the navigation URL and nothing else.
        `
    })
    // console.log(websiteURLResponse.text)
    counter.incrementConsumption(websiteURLUsage)
    const currentPage = await createSession(websiteURLResponseText)
    let formHTML = await currentPage.locator("form").innerHTML()

    const {text: collapsiblesResponseText, usage: collapsiblesUsage} = await generateText({
        model,
        output: Output.object({
            schema: CollapsiblesSchema
        }),
        temperature: 0,
        prompt:`
            Here's the HTML of a page containing a form: 
            ${formHTML}
            Find the names of all collapsible sections, and return which ones are expanded or hidden by looking at all the clues combined.
        `
    })
    // console.log(collapsiblesResponse.text)
    counter.incrementConsumption(collapsiblesUsage)
    const collapsiblesJSON: CollapsiblesType = JSON.parse(collapsiblesResponseText)
    console.log("Parsed sections...")

    // open all collapsibles and fill out the fields
    for (const {collapsibleName, collapsed} of collapsiblesJSON["collapsibles"]) {
        console.log(`Filling ${collapsibleName} section...`)

        // open collapsible if it's collapsed
        if (collapsed) {
            await currentPage.getByRole("button", { name: collapsibleName }).click()
            formHTML = await currentPage.locator("form").innerHTML()
        }

        // find all fillable fields in the HTML
        const {text: fieldsResponseText, usage: fieldsUsage} = await generateText({
            model,
            output: Output.object({
                schema: fieldsSchema
            }),
            temperature: 0,
            prompt:`
                Here's the HTML of a page containing a form:
                ${formHTML}
                Here's a workflow:
                ${workflow}
                Find all fields in the form.
                formFieldName should be the exact name of the field as written in the form HTML.
                workflowFieldName should be the corresponding name of the field from the workflow.
                Only include entries for fields that you can see in the HTML.
            `
        })
        console.log(fieldsResponseText)
        counter.incrementConsumption(fieldsUsage)
        const fieldsJSON: fieldsType = JSON.parse(fieldsResponseText)

        // fill each field found by the LLM
        for (const {formFieldName, workflowFieldName, value} of fieldsJSON["fields"]) {
            const fieldType = await currentPage.locator(`[name="${formFieldName}"]`).evaluate(element => element.tagName)
            if (fieldType == "SELECT") {
                await currentPage.locator(`select[name="${formFieldName}"]`).selectOption(value)
            } else if (fieldType == "INPUT") {
                await currentPage.locator(`input[name="${formFieldName}"]`).fill(value)
            }
        }
    }

    // submit the form
    await currentPage.getByText("Submit").click()
    console.log("Form submitted")

    counter.printConsumption()
}

main()