import { ActionNodesType, INode, NodesType, TriggerNodesType } from "@/schema";
import type { Node } from "@xyflow/react";
import { nanoid } from "nanoid";

export const generateId = () => nanoid();

const TRIGGER_NODE_TYPES: TriggerNodesType[] = [
  "ManualTrigger",
  "WebhookTrigger",
  "OnFormSubmissionTrigger",
];
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

  if (type in triggerNames) {
    return triggerNames[type as TriggerNodesType];
  }

  if (type in actionNames) {
    return actionNames[type as ActionNodesType];
  }

  return "Unknown Node";
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
    type: TRIGGER_NODE_TYPES.includes(internalNode.type as TriggerNodesType)
      ? "trigger"
      : internalNode.type === "AgentNode"
      ? "agent"
      : "action",
    position: {
      x: internalNode.position[0],
      y: internalNode.position[1],
    },
    data: internalNode,
  };
};
