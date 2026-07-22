import { generateText, Output } from "ai"
import model from "./utils/model"
import { createSession } from "./utils/browserSession"
import { workflow } from "./data/workflow"

import { CollapsiblesSchema, SelectsSchema, InputsSchema } from "./schemas"

type CollapsiblesType = {
    collapsibles: {
        collapsibleName: string
        collapsed: boolean
    }[]
}

type SelectsType = {
    selects: {
        fieldName: string
        value: string
    }[]
}

type InputsType = {
    inputs: {
        fieldName: string
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
        prompt:`
            Here's the HTML of a page containing a form: 
            ${pageHTML}
            Find all the collapsibles in that page, where "collapsed" indicates whether the section is collapsed or not.
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

        // find all fillable "select" fields in the HTML
        const selectsResponse = await generateText({
            model,
            output: Output.object({
                schema: SelectsSchema
            }),
            prompt:`
                Here's the HTML of a page containing a form:
                ${pageHTML}
                Here's a workflow:
                ${workflow}
                Find all "select" field names in the HTML.

                fieldName is the actual field name
                and value is the value that would be filled in from the Student information in (2) from the workflow.

                If there's no corresponding value from the Student information, don't include the fieldName.
                The JSON should only include fieldNames for the fields that are present in the HTML.
            `
        })
        console.log(selectsResponse.text)
        const selectsJSON: SelectsType = JSON.parse(selectsResponse.text)

        // fill each "select" field found by the LLM
        for (const {fieldName, value} of selectsJSON["selects"]) {
            await currentPage.locator(`input[name="${fieldName}"]`).selectOption(value)
        }

        // find all fillable "input" fields in the HTML
        const inputsResponse = await generateText({
            model,
            output: Output.object({
                schema: InputsSchema
            }),
            prompt:`
                Here's the HTML of a page containing a form:
                ${pageHTML}
                Here's a workflow:
                ${workflow}
                Find all "input" field names in the HTML.

                fieldName is the actual field name
                and value is the value that would be filled in from the Student information in (2) from the workflow.

                If there's no corresponding value from the Student information, don't include the fieldName.
                The JSON should only include fieldNames for the fields that are present in the HTML.
            `
        })
        console.log(inputsResponse.text)
        const inputsJSON: InputsType = JSON.parse(inputsResponse.text)

        // fill out each "input" field found by the LLM
        for (const {fieldName, value} of inputsJSON["inputs"]) {
            await currentPage.locator(`input[name="${fieldName}"]`).fill(value)
        }
    }

    // submit the form
    await currentPage.getByText("Submit").click()
    console.log("Form submitted")
}

main()