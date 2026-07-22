import { generateText, ModelMessage, Output, stepCountIs } from "ai"
import model from "./model"

// utils
import { createSession } from "./utils/browserSession"
import { tokensCounter } from "./utils/tokensConsumption"

// tools
import { createNavigateToURLTool } from "./tools/navigateToURLTool"
import { createFillFieldsTool } from "./tools/fillFieldsTool"
import { createExpandSectionTool } from "./tools/expandSectionTool"
import { createSubmitFormTool } from "./tools/submitFormTool"

export async function queryAgent(workflow: string) {
    console.log("Querying agent...")

    const counter = new tokensCounter() // for tracking tokens consumption

    const currentPage = await createSession()
    const messages: ModelMessage[] = [{
        role: "user",
        content: `
            Here's a workflow:
            ${workflow}
            Your job is to complete this workflow.
            1. Navigate to the URL.
            2. Fill in the fields you see in the HTML once you get the HTML.
            3. Expand any hidden section you find and fill out those fields as well.
            4. Submit the form.
        `
    }]

    // ask the LLM to use a tool
    const {text, usage, steps} = await generateText({
        model,
        temperature: 0,
        instructions: `
            You are an automated web agent.
            Use only one tool call per step, and do not make parallel tool calls.
            Choose what tool to use in the current step based on the result of the previous step, as well as the workflow.
            You have the following tools:
            1. navigateToURL - this allows you to navigate to the URL.  This returns a sanitized HTML of the form.
            2. fillFields - this finds all the fields visible in the HTML of the page, and fills them out.
            3. expandSection - this expands a section, possibly uncovering more fields.  If you opened a section, fill out those fields before trying to open another section.
            4. submitForm - this submits the form after opening all sections and filling out all the fields.
        `,
        messages: messages,
        tools: {
            navigateToURL: createNavigateToURLTool(currentPage),
            fillFields: createFillFieldsTool(currentPage),
            expandSection: createExpandSectionTool(currentPage),
            submitForm: createSubmitFormTool(currentPage)
        },
        stopWhen: stepCountIs(10) // to prevent agent from looping infinitely if it cannot execute the workflow
    })

    // console.log()
    // steps.forEach(step => {
    //     console.log(step.stepNumber)
    //     step.toolCalls.forEach(toolCall => console.log(toolCall.toolName, toolCall.input))
    //     console.log()
    // })
    // console.log()
    // messages.forEach(message => console.log(message))

    counter.incrementConsumption(usage)

    // close the browser
    await currentPage.context().browser()?.close()

    // print total tokens consumption
    counter.printConsumption()
}