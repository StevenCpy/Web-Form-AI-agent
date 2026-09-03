import { tool } from "ai"
import { Page } from "playwright"
import { z } from "zod"

// WebSockets
import { type Socket, type DefaultEventsMap } from "socket.io"

export function createHaltReasoningTool(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, page: Page) {
    const haltReasoningTool = tool({
        description: "Used to halt agent reasoning",
        inputSchema: z.object({
            reason: z.string("Reason why this tool was called.")
        }),
        execute: async ({ reason }) => {
            console.log(`
                Halting reasoning...
            `)

            socket.emit("notification", `Invalid workflow.  Halted agent reasoning...  Reason: ${reason}`)

            return {"result": "Halted agent reasoning"}
        }
    })

    return haltReasoningTool
}