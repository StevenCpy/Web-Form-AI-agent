import { z } from "zod";

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
            fieldName: z.string().describe("name of field in form"),
            type: z.enum(["select", "input"]).describe("field type"),
            value: z.string().describe("value from the workflow information corresponding to that field")
        })
    )
})