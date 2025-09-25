import Mustache from "mustache";
import nodemailer from "nodemailer";
import { config } from "./config/env";
import { getExecutionOrder } from "./lib";
import { prisma } from "./lib/prisma";
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

    for (const node of sequence.nodes) {
      console.log("Executing node:", node.id, "with payload:", payload);
    }

    return sequence;
  }

  executeForForm(webhookId: string, payload: any) {
    const sequence = this.getExecutionSequence(webhookId);
    let prevPayload = payload;
    if (!sequence) return;
    for (const node of sequence.nodes) {
      if (node.webhookId === webhookId) continue;

      if (node.type === "GmailNode") {
        payload = this.sendAMessage(node, payload);
      }

      this.listenerManager.emit(webhookId, {
        id: node.webhookId,
        payload,
      });
    }
  }

  async sendAMessage(node: INode, payload: any) {
    const id = node.parameters.credentials[0].id;
    const cred = await prisma.credential.findFirst({
      where: {
        id,
      },
    });
    if (!cred || !cred.data) return;

    const data = cred.data as any;
    const refreshToken = data.refresh_token as string;
    const accessToken = data.access_token as string;
    const userEmail = data.email as string;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: userEmail,
        clientId: config.google_client_id!,
        clientSecret: config.google_client_secret,
        refreshToken: refreshToken,
        accessToken: accessToken,
      },
    });

    const params = node.parameters;

    const to = Mustache.render(node.parameters.to, payload);
    const subject = Mustache.render(node.parameters.subject, payload);
    const message = Mustache.render(node.parameters.message, payload);
    const mailOptions = {
      to: to,
      subject: subject,
      html: message,
    };

    const result = await transporter.sendMail(mailOptions);
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
