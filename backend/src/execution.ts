import { getExecutionOrder } from "./lib";
import type { ListenerManager } from "./listener";
import type { ExecutionRequest, INode } from "./schema";

export interface ExecutionSequence {
  nodes: INode[];
  destinationNodeId?: string;
}

export class ExecutionManager {
  private executionOrder: Map<string, ExecutionSequence> = new Map();
  private listenerManager: ListenerManager;
  constructor(listenerManager: ListenerManager) {
    this.listenerManager = listenerManager;
  }
  executionFlow(webhookId: string, payload: ExecutionRequest) {
    const order = getExecutionOrder(payload.workflowData, payload.startNodes);
    if (order && order.length > 0) {
      this.executionOrder.set(webhookId, {
        destinationNodeId: payload.destinationNode,
        nodes: order,
      });
    }
  }

  executeForWebhook(webhookId: string, payload: any) {
    const sequence = this.executionOrder.get(webhookId);
    if (!sequence) return;

    // You can loop through nodes and execute them here
    for (const node of sequence.nodes) {
      console.log("Executing node:", node.id, "with payload:", payload);
      // Your actual execution logic per node goes here
    }

    return sequence;
  }
  getExecutionSequence(webhookId: string) {
    return this.executionOrder.get(webhookId);
  }

  clearExecution(webhookId: string) {
    this.executionOrder.delete(webhookId);
  }

  clearAll() {
    this.executionOrder.clear();
  }
}
