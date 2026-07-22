import { generateText } from "ai"
import model from "./utils/model"
import { createSession } from "./utils/browserSession"
import { workflow } from "./data/workflow"

type CollapsiblesType = {
    [collapsibleName: string]: {collapsed: boolean}
}

type SelectsType = {
    [label: string]: string
}

type InputsType = {
    [label: string]: string
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
        prompt:`
            <context>
            Your role is to extract information as you see them in the HTML.
            </context>

            <input>
            Here's the HTML of a page containing a form: 
            ${pageHTML}
            </input>

            <task>
            Find all collapsibles in the form and return an array of JSON objects of the form [{collapsibleName: string, collapsed: bool}, ...]
            where collapsibleName is the name of the section
            and collapsed indicates whether the section is collapsed or not.
            </task>
        `
    })
    console.log(collapsiblesResponse.text)
    const collapsibles: CollapsiblesType = JSON.parse(collapsiblesResponse.text)

    // open all collapsibles and fill out the fields
    for (const collapsible in collapsibles) {
        // open collapsible if it's collapsed
        if (collapsibles[collapsible].collapsed) {
            await currentPage.getByRole("button", { name: collapsible }).click()
            pageHTML = await currentPage.content()
        }

        // find all fillable "select" fields in the HTML
        const selectsResponse = await generateText({
            model,
            prompt:`
                Here's the HTML of a page containing a form:
                ${pageHTML}
                Here's a workflow:
                ${workflow}
                Find all "select" field names in the HTML and return a single JSON of the form {fieldName: value, ...}.
                Replace each fieldName with the actual field name,
                and value with the value that would be filled in from the Student information in (2) from the workflow.
                Do NOT include names for "input" fields in the JSON.
                If there's no corresponding value from the Student information, don't include the fieldName.
                The JSON should only include fieldNames for the fields that are present in the HTML.
                Return ONLY the JSON, no explanations and no "json" in the output.
            `
        })
        console.log(selectsResponse.text)
        const selects: SelectsType = JSON.parse(selectsResponse.text)

        // fill each "select" field found by the LLM
        for (const selectLabel in selects) {
            await currentPage.getByLabel(selectLabel).selectOption(selects[selectLabel])
        }

        // find all fillable "input" fields in the HTML
        const inputsResponse = await generateText({
            model,
            prompt:`
                Here's the HTML of a page containing a form:
                ${pageHTML}
                Here's a workflow:
                ${workflow}
                Find all "input" field names in the HTML and return a single JSON of the form {fieldName: value, ...}.
                Replace each fieldName with the actual field name,
                and value with the value that would be filled in from the Student information in (2) from the workflow.
                Do NOT include names for "select" fields in the JSON.
                If there's no corresponding value from the Student information, don't include the fieldName.
                The JSON should only include fieldNames for the fields that are present in the HTML.
                Return ONLY the JSON, no explanations and no "json" in the output.
            `
        })
        console.log(inputsResponse.text)
        const inputs: InputsType = JSON.parse(inputsResponse.text)

        // fill out each "input" field found by the LLM
        for (const inputLabel in inputs) {
            console.log(inputLabel)
            await currentPage.locator(`input[name="${inputLabel}"]`).fill(inputs[inputLabel])
        }
    }

    // submit the form
    await currentPage.getByText("Submit").click()
    console.log("Form submitted")
}

main()