import z from "zod";

export const TriggerNode = z.enum([
  "ManualTrigger",
  "WebhookTrigger",
  "OnFormSubmissionTrigger",
]);
const ActionNode = z.enum(["GmailNode", "AgentNode", "TelegramNode", "IfNode"]);
const AIMODELS = z.enum(["Gemini", "OpenAI"]);
const allNodes = z.union([TriggerNode, ActionNode, AIMODELS]);
const INode = z.object({
  id: z.string(),
  name: z.string(),
  parameters: z.record(z.string(), z.any()),
  type: allNodes,
  position: z.tuple([z.int(), z.int()]),
  credentials: z
    .record(
      z.string(),
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .optional(),
  webhookId: z.string().optional(),
});

const IConnection = z.record(
  z.string(),
  z.object({
    main: z.array(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          index: z.number().int(),
        })
      )
    ),
  })
);

export const WorkflowType = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  nodes: z.array(INode),
  connections: IConnection,
});

export type WorkflowType = z.infer<typeof WorkflowType>;
export type IConnection = z.infer<typeof IConnection>;
export type INode = z.infer<typeof INode>;
export type NodesType = z.infer<typeof allNodes>;
export type TriggerNodesType = z.infer<typeof TriggerNode>;
export type ActionNodesType = z.infer<typeof ActionNode>;
export type AIMOdelType = z.infer<typeof AIMODELS>;
