import { tool } from "ai"
import { Page } from "playwright"
import { z } from "zod"

// WebSockets
import { type Socket, type DefaultEventsMap } from "socket.io"

export function createSubmitFormTool(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, page: Page) {
    const submitFormTool = tool({
        description: "Submits the form.",
        inputSchema: z.object({
            submitButtonName: z.string()
        }),
        outputSchema: z.object({
            result: z.string().describe("The result of using the tool.")
        }),
        // submits the form
        execute: async () => {
            console.log("Submitting the form")
            await page.locator("form").locator('button[type="submit"]').click()

            // emit screenshot along with notification
            const screenshot_buf = await page.screenshot()
            const screenshot_base64 = screenshot_buf.toString("base64")
            socket.emit("screenshot", ["Submitted form...", screenshot_base64])

            return {result: "Successfully submitted form!"}
        }
    })

    return submitFormTool
}