import { tool } from "ai"
import { Page } from "playwright"
import { z } from "zod"

export function createSubmitFormTool(page: Page) {
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
            return {result: "Successfully submitted form!"}
        }
    })
    return submitFormTool
}