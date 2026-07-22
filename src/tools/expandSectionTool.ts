import { tool } from "ai"
import { Page } from "playwright"
import { z } from "zod"
import { sanitizeHTML } from "../utils/sanitizeHTML"

const sectionSchema = z.object({
    sectionName: z.string().describe("The name of the collapsible section"),
    collapsed: z.boolean().describe("true if section is collapsed/hidden, false otherwise")
})

export function createExpandSectionTool(page: Page) {
    const expandSectionTool = tool({
        description: "Expands a collapsed/hidden section in the form.  It can only be used after you are provided with HTML.  Only attempt to expand a section you have not tried to expand previously.",
        inputSchema: sectionSchema,
        outputSchema: z.object({
            formHTML: z.string().describe("The updated form HTML after expanding the section."),
            result: z.string().describe("The result of using the tool.")
        }),
        // expand section if not already expanded and return the updated form HTML if any section was expanded
        execute: async ({ sectionName, collapsed }) => {
            console.log(`
                Attempting to expand section...
                Section:
                ${sectionName}
            `)
            if (collapsed) {
                await page.getByRole("button", { name: sectionName }).click()
                const updatedFormHTML = await sanitizeHTML(page.locator("form"))
                return {formHTML: updatedFormHTML, "result": `Successfully expanded section ${sectionName}.  Updated HTML with possibly new fields`}
            } else {
                const formHTML = await page.locator("form").innerHTML()
                return {formHTML: formHTML, "result": `Section: ${sectionName} was already expanded`}
            }
        }
    })
    return expandSectionTool
}