import { tool } from "ai"
import { Page } from "playwright"
import { z } from "zod"
import { pruneHTML } from "../utils/pruneHTML"

// WebSockets
import { type Socket, type DefaultEventsMap } from "socket.io"

export function createNavigateToURLTool(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, page: Page) {
    const navigateToURLTool = tool({
        description: "Navigates the browser to the navigation URL and returns the sanitized HTML of the form.",
        inputSchema: z.object({
            navigationURL: z.string()
        }),
        outputSchema: z.object({
            formHTML: z.string().describe("The sanitized HTML of the form."),
            result: z.string().describe("The result of using the tool.")
        }),
        // open an interactive Chrome page to the website
        execute: async ({ navigationURL }) => {
            console.log(`Navigating to ${navigationURL}`)
            await page.goto(navigationURL)
            const formHTML = await pruneHTML(page.locator("form"))

            // emit screenshot along with notification
            const screenshot_buf = await page.screenshot()
            const screenshot_base64 = screenshot_buf.toString("base64")
            socket.emit("screenshot", [`Navigated to ${navigationURL}...`, screenshot_base64])

            return {formHTML: formHTML, result: `Successfully navigated to ${navigationURL}`}
        }
    })

    return navigateToURLTool
}