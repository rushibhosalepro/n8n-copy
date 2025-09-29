import {
  ActionNodesType,
  INode,
  LLMModelsType,
  NodesType,
  ToolsType,
  TriggerNodesType,
} from "@/schema";
import type { Node } from "@xyflow/react";
import { nanoid } from "nanoid";

export const generateId = () => nanoid();

const TRIGGER_NODE_TYPES: TriggerNodesType[] = [
  "ManualTrigger",
  "WebhookTrigger",
  "OnFormSubmissionTrigger",
];

const LLM_NODE_TYPES: LLMModelsType[] = ["Gemini", "OpenAI"];

export const getNodeName = (type: NodesType): string => {
  const triggerNames: Record<TriggerNodesType, string> = {
    ManualTrigger: "Manual Trigger",
    WebhookTrigger: "Webhook Trigger",
    OnFormSubmissionTrigger: "Form Submission Trigger",
  };

  const actionNames: Record<ActionNodesType, string> = {
    GmailNode: "Gmail",
    AgentNode: "Agent",
    TelegramNode: "Telegram",
    IfNode: "If Condition",
  };

  const LLNames: Record<LLMModelsType, string> = {
    Gemini: "Gemini",
    OpenAI: "OpenAI",
  };

  const Tools: Record<ToolsType, string> = {
    CodeTool: "Code Tool",
  };

  if (type in triggerNames) return triggerNames[type as TriggerNodesType];
  if (type in actionNames) return actionNames[type as ActionNodesType];
  if (type in LLNames) return LLNames[type as LLMModelsType];
  if (type in Tools) return Tools[type as ToolsType];
  return "Unknown Node";
};

const resolveNodeCategory = (type: NodesType): string => {
  if (TRIGGER_NODE_TYPES.includes(type as TriggerNodesType)) return "trigger";
  if (type === "AgentNode") return "agent";
  if (LLM_NODE_TYPES.includes(type as LLMModelsType)) return "ai";
  if (type === "CodeTool") return "codeTool";
  return "action";
};

export const getSourceHandle = (node: INode) => {
  if (LLM_NODE_TYPES.includes(node.type as LLMModelsType)) {
    return "out-llm";
  } else if (node.type === "CodeTool") return "out-tools";

  return null;
};
export const createNode = (node: Partial<INode>): Node<INode> => {
  const internalNode: INode = {
    id: node.id ?? generateId(),
    name: node.name ?? getNodeName(node.type!),
    type: node.type ?? "ManualTrigger",
    parameters: node.parameters ?? {},
    position: node.position ?? [0, 0],
    credentials: node.credentials ?? {},
    webhookId: node.webhookId ?? "",
  };

  return {
    id: internalNode.id,
    type: resolveNodeCategory(internalNode.type),
    position: {
      x: internalNode.position[0],
      y: internalNode.position[1],
    },
    data: internalNode,
  };
};
