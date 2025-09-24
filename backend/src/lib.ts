import type { INode, WorkflowType } from "./schema";
export const getTriggerNode = (workflow: WorkflowType) => {
  return workflow.nodes.find((n) =>
    ["ManualTrigger", "WebhookTrigger", "OnFormSubmissionTrigger"].includes(
      n.type
    )
  );
};

export const getSingleNode = (workflow: WorkflowType, nodeId: string) => {
  return workflow.nodes.find((node) => node.id === nodeId) || null;
};

export const getExecutionOrder = (
  workflow: WorkflowType,
  startNodes?: string[]
) => {
  const order: INode[] = [];
  const visited = new Set<string>();

  const visit = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    order.push(node);
    const connections = workflow.connections[nodeId]?.main ?? [];
    connections.forEach((arr) => arr.forEach((c) => visit(c.id)));
  };
  const starts = startNodes?.length
    ? startNodes
    : workflow.nodes
        .filter((n) =>
          [
            "ManualTrigger",
            "WebhookTrigger",
            "OnFormSubmissionTrigger",
          ].includes(n.type)
        )
        .map((n) => n.id);
  starts.forEach(visit);

  return order;
};
