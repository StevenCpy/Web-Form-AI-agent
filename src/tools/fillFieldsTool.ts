import { tool } from "ai"
import { Page } from "playwright"
import { z } from "zod"
import { fieldsSchema } from "../schemas"

export function createFillFieldsTool(page: Page) {
    const fillFieldsTool = tool({
        description: "Finds the fields in the HTML, and fills them out.  It can only be used when you are provided with HTML.",
        inputSchema: fieldsSchema,
        outputSchema: z.object({
            status: z.string()
        }),
        // fill out fields
        execute: async ({ fields }) => {
            console.log(`
                Filling out fields...
                Fields:
                ${fields}
            `)
            for (const {formFieldName, value} of fields) {
                const fieldType = await page.locator(`[name="${formFieldName}"]`).evaluate(element => element.tagName)
                if (fieldType == "SELECT") {
                    await page.locator(`[name="${formFieldName}"]`).selectOption(value)
                } else if (fieldType == "INPUT" || fieldType == "TEXTAREA") {
                    await page.locator(`[name="${formFieldName}"]`).fill(value)
                }
            }

            return {"status": "success"}
        }
    })
    return fillFieldsTool
}