import { tool } from "ai"
import { Page } from "playwright"
import { z } from "zod"
import { sanitizeHTML } from "../utils/sanitizeHTML"

export function createNavigateToURLTool(page: Page) {
    const navigateToURLTool = tool({
        description: "Navigates the browser to the navigation URL and returns the sanitized HTML of the form.",
        inputSchema: z.object({
            navigationURL: z.string()
        }),
        outputSchema: z.object({
            formHTML: z.string()
        }),
        // open an interactive Chrome page to the website
        execute: async ({ navigationURL }) => {
            console.log(`Navigating to ${navigationURL}`)
            await page.goto(navigationURL)
            const formHTML = await sanitizeHTML(page.locator("form"))
            return {formHTML: formHTML}
        }
    })
    return navigateToURLTool
}