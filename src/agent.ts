import { generateText, Output } from "ai"
import model from "./utils/model"
import { createSession } from "./utils/browserSession"

import { CollapsiblesSchema, fieldsSchema } from "./schemas"
import { tokensCounter } from "./utils/tokensConsumption"
import { sanitizeHTML } from "./utils/sanitizeHTML"

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

export async function queryAgent(workflow: string) {
    console.log("Querying agent...")

    const counter = new tokensCounter()

    // STEP 1 - Go to website's URL
    let websiteURLResponseText = ""
    try {
        const {text, usage} = await generateText({
            model,
            prompt:`
                Here's a workflow:
                ${workflow}
                Return only the navigation URL and nothing else.
            `
        })
        websiteURLResponseText = text
        counter.incrementConsumption(usage)
        console.log(websiteURLResponseText)
    } catch (error) {
        console.log("Error calling LLM API: ", error)
        return
    }
    // this will open an interactive Chrome page
    const currentPage = await createSession(websiteURLResponseText)
    const browser = currentPage.context().browser()
    let formHTML = await sanitizeHTML(currentPage.locator("form"))

    console.log("Parsing sections...")
    let collapsiblesResponseText = ""
    try {
        const {text, usage} = await generateText({
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
        collapsiblesResponseText = text
        counter.incrementConsumption(usage)
        console.log(collapsiblesResponseText)
    } catch (error) {
        console.log("Error calling LLM API: ", error)
        await browser?.close()
        return
    }
    const collapsiblesJSON: CollapsiblesType = JSON.parse(collapsiblesResponseText)

    // open all collapsibles and fill out the fields
    for (const {collapsibleName, collapsed} of collapsiblesJSON["collapsibles"]) {
        console.log(`Filling ${collapsibleName} section...`)

        // open collapsible if it's collapsed
        if (collapsed) {
            await currentPage.getByRole("button", { name: collapsibleName }).click()
            formHTML = await sanitizeHTML(currentPage.locator("form"))
        }

        // find all fillable fields in the HTML
        let fieldsResponseText = ""
        try {
            const {text, usage} = await generateText({
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
                    value should be the corresponding value that would fit in that field.
                    Only include entries for fields that you can see in the HTML.
                `
            })
            fieldsResponseText = text
            counter.incrementConsumption(usage)
            console.log(fieldsResponseText)
        } catch (error) {
            console.log("Error calling LLM API: ", error)
            await browser?.close()
            return
        }
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
    console.log("Form submitted!")

    // close the browser
    await browser?.close()

    // print total tokens consumption
    counter.printConsumption()
}