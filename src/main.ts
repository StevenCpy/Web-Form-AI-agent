import { generateText } from "ai"
import model from "./utils/model"
import { createSession } from "./utils/browserSession"
import { workflow } from "./data/workflow"

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

}

main()