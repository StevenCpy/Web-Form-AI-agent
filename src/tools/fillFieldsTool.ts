import { tool } from "ai"
import { Page } from "playwright"
import { z } from "zod"

const fieldsSchema = z.object({
    fields: z.array(
        z.object({
            formFieldName: z.string().describe("The name of the field as written in the form."),
            workflowFieldName: z.string().describe("The field described in the workflow that matches the field name in the form."),
            value: z.string().describe("Value from the workflow information that would fit in that field.")
        })
    )
})

export function createFillFieldsTool(page: Page) {
    const fillFieldsTool = tool({
        description: "Finds unfilled fields in the HTML, and fills them out.  It can only be used after you are provided with HTML.  If a field is in the workflow but not in the HTML, do not include it.",
        inputSchema: fieldsSchema,
        outputSchema: z.object({
            result: z.string().describe("The result of using the tool.")
        }),
        // fill out fields
        execute: async ({ fields }) => {
            const formFieldNames = fields.map(field => field.formFieldName)
            console.log(`
                Filling out fields...
                Fields:
                ${formFieldNames.join(",")}
            `)
            for (const {formFieldName, value} of fields) {
                const fieldType = await page.locator(`[name="${formFieldName}"]`).evaluate(element => element.tagName)
                if (fieldType == "SELECT") {
                    await page.locator(`[name="${formFieldName}"]`).selectOption(value)
                } else if (fieldType == "INPUT" || fieldType == "TEXTAREA") {
                    await page.locator(`[name="${formFieldName}"]`).fill(value)
                }
            }
            if (fields.length == 0) { // no fields were filled
                return {"result": "No fields were filled"}
            } else {
                return {"result": `Successfully filled out the following fields: ${formFieldNames.join(",")}`}
            }
        }
    })
    return fillFieldsTool
}