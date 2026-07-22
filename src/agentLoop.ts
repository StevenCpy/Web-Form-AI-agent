import { generateText, isStepCount, ModelMessage, Output, stepCountIs } from "ai"
import { Page } from "playwright"
import model from "./model"
import { createSession } from "./utils/browserSession"

import { CollapsiblesSchema, fieldsSchema } from "./schemas"
import { tokensCounter } from "./utils/tokensConsumption"
import { sanitizeHTML } from "./utils/sanitizeHTML"

// tools
import { createNavigateToURLTool } from "./tools/navigateToURLTool"
import { createFillFieldsTool } from "./tools/fillFieldsTool"

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
            1. Navigate to the URL
            2. Fill in the fields you see in the HTML once you get the HTML
        `
    }]

    const maxLoops = 1
    let i = 0
    while (i < maxLoops) {
        // ask the LLM to use a tool
        const {text, usage, toolResults, steps} = await generateText({
            model,
            temperature: 0,
            instructions: `
                You are an automated web agent.
                Use only one tool call per step, and do not make parallel tool calls.
                Choose what tool to use in the current step based on the result of the previous step, as well as the workflow.
                You have the following tools:
                1. navigateToURL - allows you to navigate to the URL.  This returns a sanitized HTML of the form.
                2. fillFields - this finds all the fields visible in the HTML of the page, and fills them out.
            `,
            messages: messages,
            tools: {
                navigateToURL: createNavigateToURLTool(currentPage),
                fillFields: createFillFieldsTool(currentPage)
            },
            stopWhen: stepCountIs(5)
        })

        ++i

        console.log(text)
        console.log()
        steps.forEach(step => {
            console.log(step.stepNumber)
            step.toolCalls.forEach(toolCall => console.log(toolCall, toolCall.toolName, toolCall.input))
            console.log()
        })
        messages.forEach(message => console.log(message))

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