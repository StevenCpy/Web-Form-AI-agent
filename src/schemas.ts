import { z } from "zod";

export const CollapsiblesSchema = z.object({
    collapsibles: z.array(
        z.object({
            collapsibleName: z.string().describe("Section name from the form"),
            collapsed: z.boolean().describe("true is section is collapsed, false otherwise")
        })
    )
})

export const SelectsSchema = z.object({
    selects: z.array(
        z.object({
            fieldName: z.string().describe("name of 'select' field in form"),
            value: z.string().describe("corresponds to value that would be filled in from workflow information for that field")
        })
    )
})

export const InputsSchema = z.object({
    inputs: z.array(
        z.object({
            fieldName: z.string().describe("name of 'input' field in form"),
            value: z.string().describe("corresponds to value that would be filled in from workflow information for that field")
        })
    )
})