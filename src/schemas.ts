import { z } from "zod"

export const CollapsiblesSchema = z.object({
    collapsibles: z.array(
        z.object({
            collapsibleName: z.string().describe("Section name from form"),
            collapsed: z.boolean().describe("true is opened, false if closed")
        })
    )
})

export const fieldsSchema = z.object({
    fields: z.array(
        z.object({
            formFieldName: z.string().describe("name property of field in form"),
            workflowFieldName: z.string().describe("field described in workflow that matches the one in the form"),
            value: z.string().describe("value from the workflow information that would fit in that field")
        })
    )
})