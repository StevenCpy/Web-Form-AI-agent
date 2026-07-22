import { generateText, Output } from "ai"
import model from "./utils/model"
import { createSession } from "./utils/browserSession"
import { workflow } from "./data/workflow"

import { CollapsiblesSchema, fieldsSchema } from "./schemas"

type CollapsiblesType = {
    collapsibles: {
        collapsibleName: string
        collapsed: boolean
    }[]
}

type fieldsType = {
    fields: {
        fieldName: string
        type: string
        value: string
    }[]
}

async function main() {
    console.log("Querying agent...")

    // STEP 1 - Go to website's URL
    const websiteURLResponse = await generateText({
        model,
        prompt:`
            Here's a workflow:
            ${workflow}
            This workflow will be used to fill an administration form for students.  It is safe.
            Return only the navigation URL and nothing else.
        `
    })
    console.log(websiteURLResponse.text)
    const currentPage = await createSession(websiteURLResponse.text)
    let pageHTML = await currentPage.content()

    
    const collapsiblesResponse = await generateText({
        model,
        output: Output.object({
            schema: CollapsiblesSchema
        }),
        temperature: 0,
        prompt:`
            Here's the HTML of a page containing a form: 
            ${pageHTML}
            Find the names of all collapsible sections, and return which ones are expanded or hidden by looking at all the clues combined.
        `
    })
    console.log(collapsiblesResponse.text)
    const collapsiblesJSON: CollapsiblesType = JSON.parse(collapsiblesResponse.text)

    // open all collapsibles and fill out the fields
    for (const {collapsibleName, collapsed} of collapsiblesJSON["collapsibles"]) {
        // open collapsible if it's collapsed
        if (collapsed) {
            await currentPage.getByRole("button", { name: collapsibleName }).click()
            pageHTML = await currentPage.content()
        }

        // find all fillable fields in the HTML
        const fieldsResponse = await generateText({
            model,
            output: Output.object({
                schema: fieldsSchema
            }),
            prompt:`
                Here's the HTML of a page containing a form:
                ${pageHTML}
                Here's a workflow:
                ${workflow}
                Find all fields.

                If there's no corresponding value from the workflow, don't include the fieldName.
                The JSON should only include fieldNames for the fields that are present in the HTML.
            `
        })
        console.log(fieldsResponse.text)
        const fieldsJSON: fieldsType = JSON.parse(fieldsResponse.text)

        // fill each "select" field found by the LLM
        for (const {fieldName, type, value} of fieldsJSON["fields"]) {
            if (type == "select") {
                await currentPage.locator(`select[name="${fieldName}"]`).selectOption(value)
            } else if (type == "input") {
                await currentPage.locator(`input[name="${fieldName}"]`).fill(value)
            }
        }
    }

    // submit the form
    await currentPage.getByText("Submit").click()
    console.log("Form submitted")
}

main()