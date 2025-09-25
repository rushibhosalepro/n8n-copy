import WebSocket from "ws";
import type { INode } from "./schema";

interface Listener {
  nodeData: INode | null;
  sockets: Set<WebSocket>;
}

export class ListenerManager {
  private listeners: Map<string, Listener> = new Map();

  addListener(node: INode, ws?: WebSocket) {
    const webhookId =
      node.type === "WebhookTrigger"
        ? node.parameters?.path ?? node.webhookId
        : node.webhookId;

    const existing = this.listeners.get(webhookId);

    if (existing) {
      existing.nodeData = node;
      if (ws) existing.sockets.add(ws);
    } else {
      const sockets = ws ? new Set([ws]) : new Set<WebSocket>();
      this.listeners.set(webhookId, { nodeData: node, sockets });
    }
  }

  participate(webhookId: string, ws: WebSocket) {
    if (!this.listeners.has(webhookId)) {
      this.listeners.set(webhookId, {
        nodeData: null,
        sockets: new Set(),
      });
    }
    this.listeners.get(webhookId)!.sockets.add(ws);
  }

  removeListener(webhookId: string, ws?: WebSocket) {
    const listener = this.listeners.get(webhookId);
    if (!listener) return;

    if (ws) {
      listener.sockets.delete(ws);
      if (listener.sockets.size === 0) this.listeners.delete(webhookId);
    } else {
      this.listeners.delete(webhookId);
    }
  }

  emit(webhookId: string, data: any) {
    const listener = this.listeners.get(webhookId);
    if (!listener) return;

    listener.sockets.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }

  getNode(webhookId: string) {
    return this.listeners.get(webhookId)?.nodeData;
  }
  hasListener(webhookId: string) {
    return this.listeners.has(webhookId);
  }

  clearAll() {
    this.listeners.clear();
  }
}
