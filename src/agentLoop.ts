import { generateText, isStepCount, ModelMessage, Output, stepCountIs } from "ai"
import { Page } from "playwright"
import model from "./model"
import { createSession } from "./utils/browserSession"

import { CollapsiblesSchema, fieldsSchema } from "./schemas"
import { tokensCounter } from "./utils/tokensConsumption"
import { sanitizeHTML } from "./utils/sanitizeHTML"

// tools
import { createNavigateToURLTool } from "./tools/navigateToURLTool"

export async function queryAgentLoop(workflow: string) {
    console.log("Querying agent...")

    const counter = new tokensCounter() // for tracking tokens consumption

    const currentPage = await createSession()
    const messages: ModelMessage[] = [{
        role: "user",
        content: `
            Here's a workflow:
            ${workflow}
            Your job is to complete this workflow.
        `
    }]

    const maxLoops = 1
    let i = 0
    while (i < maxLoops) {
        // ask the LLM to use a tool
        const {text, usage, toolResults} = await generateText({
            model,
            temperature: 0,
            messages: messages,
            tools: {
                navigateToURL: createNavigateToURLTool(currentPage)
            },
            stopWhen: stepCountIs(3)
        })

        ++i

        console.log(text)
        console.log(toolResults)
        counter.incrementConsumption(usage)
        counter.printConsumption()
    }

    // // submit the form
    // await currentPage.getByText("Submit").click()
    // console.log("Form submitted!")

    // // close the browser
    // await browser?.close()

    // // print total tokens consumption
    // counter.printConsumption()
}