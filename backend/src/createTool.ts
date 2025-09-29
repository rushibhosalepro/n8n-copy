import { DynamicStructuredTool } from "@langchain/core/tools";
import z from "zod";
import type { INode } from "./schema";

export const createTool = (node: INode) => {
  const toolDescription =
    node.parameters.description || "A custom code execution tool";
  const toolCode = node.parameters.code || "";
  const name = node.parameters.name;
  const inputSchema = z.any();
  return new DynamicStructuredTool({
    name,
    description: `${toolDescription}`,
    schema: inputSchema,
    func: async (input: any) => {
      try {
        console.log(input, toolCode);
        const toolFunction = new Function("$input", toolCode);
        const result = await toolFunction(input);

        console.log(`result : `, result);
        return typeof result === "string" ? result : JSON.stringify(result);
      } catch (error: any) {
        return `Error executing tool: ${error.message}`;
      }
    },
  });
};
