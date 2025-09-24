import api from "@/lib/api";
import { WorkflowType } from "@/schema";

export const getTriggerNode = (workflow: WorkflowType) => {
  return workflow.nodes.find((n) =>
    ["ManualTrigger", "WebhookTrigger", "OnFormSubmissionTrigger"].includes(
      n.type
    )
  );
};

export const getUpstreamNodes = (
  workflow: WorkflowType,
  nodeId: string,
  visited = new Set<string>()
): string[] => {
  if (visited.has(nodeId)) return [];
  visited.add(nodeId);

  const upstream: string[] = [];

  Object.entries(workflow.connections).forEach(([sourceId, conn]) => {
    conn.main.forEach((branch) => {
      branch.forEach((target) => {
        if (target.id === nodeId) {
          upstream.push(sourceId);
          upstream.push(...getUpstreamNodes(workflow, sourceId, visited));
        }
      });
    });
  });

  return upstream;
};

export const buildExecutionRequest = (
  workflow: WorkflowType,
  options: {
    destinationNodeId?: string;
    runFullWorkflow?: boolean;
    runUpToPrevious?: boolean;
  }
) => {
  const { destinationNodeId, runFullWorkflow, runUpToPrevious } = options;
  const triggerNode = getTriggerNode(workflow);
  if (!triggerNode) throw new Error("No trigger node found");

  let destination = destinationNodeId;

  if (runUpToPrevious && destinationNodeId) {
    const upstreamNodes = getUpstreamNodes(workflow, destinationNodeId);
    if (upstreamNodes.length) {
      destination = upstreamNodes[0];
    }
  }

  return {
    workflowData: workflow,
    executionMode: runFullWorkflow ? "manual" : "trigger",
    startNodes: [triggerNode.id],
    destinationNode: destination,
  };
};

export const executeWorkflow = async (
  workflow: WorkflowType,
  options: {
    destinationNodeId?: string;
    runFullWorkflow?: boolean;
    runUpToPrevious?: boolean;
  }
) => {
  const request = buildExecutionRequest(workflow, options);
  try {
    const response = await api.post(`/run`, request);
    return response.data;
  } catch (err: any) {
    console.error("Execution error:", err.response?.data || err.message);
    throw err;
  }
};
