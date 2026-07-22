import { generateText } from "ai"
import model from "./utils/model"
import { createSession } from "./utils/browserSession"
import { workflow } from "./data/workflow"

type ResponseJSONType = {
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
    const pageHTML = await currentPage.content()

    const response = await generateText({
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
    console.log(response.text)
    const responseJSON: ResponseJSONType = JSON.parse(response.text)

    // fill out each field found by the LLM
    for (const fieldName in responseJSON) {
        console.log(fieldName)
        await currentPage.locator(`input[name="${fieldName}"]`).fill(responseJSON[fieldName])
    }

    await currentPage.getByText("Submit").click()
}

main()