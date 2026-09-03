import { generateText, hasToolCall, ModelMessage, Output, stepCountIs } from "ai"
import model from "./model"

// utils
import { createSession } from "./utils/browserSession"
import { tokensCounter } from "./utils/tokensConsumption"

// tools
import { createNavigateToURLTool } from "./tools/navigateToURLTool"
import { createFillFieldsTool } from "./tools/fillFieldsTool"
import { createExpandSectionTool } from "./tools/expandSectionTool"
import { createSubmitFormTool } from "./tools/submitFormTool"
import { createHaltReasoningTool } from "./tools/haltReasoningTool"

import { type Socket, type DefaultEventsMap } from "socket.io"

export async function queryAgent(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, workflow: string) {
    console.log("Querying agent...")
    socket.emit("notification", "Filling out form...")

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
            If you already filled all the possible fields, head to step 4.
            3. Expand any hidden section you find and fill out those fields as well.
            4. Submit the form.
        `
    }]

    // ask the LLM to use a tool
    try {
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
                5. haltReasoning - this is used if you need to stop prematurely.  Use this tool if the workflow doesn't have a URL to navigate to, the page is inaccessible, or there are no fields mentioned in the workflow.
            `,
            messages: messages,
            tools: {
                navigateToURL: createNavigateToURLTool(socket, currentPage),
                fillFields: createFillFieldsTool(socket, currentPage),
                expandSection: createExpandSectionTool(socket, currentPage),
                submitForm: createSubmitFormTool(socket, currentPage),
                haltReasoning: createHaltReasoningTool(socket, currentPage)
            },
            stopWhen: [stepCountIs(10), hasToolCall("submitForm"), hasToolCall("haltReasoning")] // to prevent agent from looping infinitely if it cannot execute the workflow
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
    } catch (error) {
        console.error("Error calling LLM API: ", error)
        throw(new Error("ERROR: Agent could not execute workflow"))
    } finally {
        // close the browser
        await currentPage.context().browser()?.close()
        socket.emit("notification", "Workflow completed...")
    }

    // print total tokens consumption
    counter.printConsumption()
}