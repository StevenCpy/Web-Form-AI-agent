import { tool } from "ai"
import { Page } from "playwright"
import { z } from "zod"

export function createNavigateToURLTool(page: Page) {
    const navigateToURLTool = tool({
        description: "Extract navigation URL from workflow",
        inputSchema: z.object({
            navigationURL: z.string()
        }),
        // open an interactive Chrome page to the website
        execute: async ({ navigationURL }) => {
            console.log(`Navigating to ${navigationURL}`)
            await page.goto(navigationURL)
        }
    })
    return navigateToURLTool
}