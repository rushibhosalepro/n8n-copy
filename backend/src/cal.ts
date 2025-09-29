import { DynamicStructuredTool } from "@langchain/core/tools";
import z from "zod";

const calculatorSchema = z.object({
  operation: z.enum(["add", "subtract", "multiply", "divide"]),
  a: z.number(),
  b: z.number(),
});

export const calculatorTool = new DynamicStructuredTool({
  name: "calculator",
  description: "Performs basic arithmetic operations",
  schema: calculatorSchema,
  func: async (input: z.infer<typeof calculatorSchema>) => {
    const { operation, a, b } = input;
    switch (operation) {
      case "add":
        return (a + b).toString();
      case "subtract":
        return (a - b).toString();
      case "multiply":
        return (a * b).toString();
      case "divide":
        return (a / b).toString();
    }
  },
});
