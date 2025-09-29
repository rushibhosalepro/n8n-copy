import { DynamicStructuredTool } from "@langchain/core/tools";
import z from "zod";
import type { INode } from "./schema";

export const createTool = (node: INode) => {
  const toolDescription =
    node.parameters.description || "A custom code execution tool";
  const toolCode = node.parameters.code || "";
  const language = node.parameters.language || "javascript";
  const name = node.parameters.name;
  const inputSchema = z.object({
    query: z.string().describe("The input query or parameters for the tool"),
  });

  //   new DynamicStructuredTool({
  //         name: "calculator",
  //         description: "Performs basic arithmetic operations",
  //         schema: calculatorSchema,
  //         func: async (input: z.infer<typeof calculatorSchema>) => {
  //           const { operation, a, b } = input;
  //           switch (operation) {
  //             case "add":
  //               return (a + b).toString();
  //             case "subtract":
  //               return (a - b).toString();
  //             case "multiply":
  //               return (a * b).toString();
  //             case "divide":
  //               return (a / b).toString();
  //           }
  //         },
  //       }),
  return new DynamicStructuredTool({
    name,
    description: `${toolDescription}    code lanaguge - ${language}`,
    schema: inputSchema,
    func: async (input: any) => {
      try {
        const toolFunction = new Function("$input", "$json", toolCode);
        const result = await toolFunction(input.query, input);
        return typeof result === "string" ? result : JSON.stringify(result);
      } catch (error: any) {
        return `Error executing tool: ${error.message}`;
      }
    },
  });
};
