import axios from "axios";
import Mustache from "mustache";
import nodemailer from "nodemailer";
import { config } from "./config/env";
import { prisma } from "./lib/prisma";
import type { ListenerManager } from "./listener";
import type { ExecutionRequest, INode, WorkflowType } from "./schema";
export interface ExecutionSequence {
  wf: WorkflowType;
  destinationNodeId?: string;
}

export class ExecutionManager {
  private executionOrder: Map<string, ExecutionSequence> = new Map();
  private listenerManager: ListenerManager;

  constructor(listenerManager: ListenerManager) {
    this.listenerManager = listenerManager;
  }

  registerWf(webhookId: string, payload: ExecutionRequest) {
    this.executionOrder.set(webhookId, {
      destinationNodeId: payload.destinationNode,
      wf: payload.workflowData,
    });
  }

  getWf(webhookId: string) {
    if (this.executionOrder.get(webhookId))
      return this.executionOrder.get(webhookId)?.wf;
    return null;
  }

  getNodeByWebhookId(webhookId: string, nodes: INode[]) {
    return nodes.find((n) => n.webhookId === webhookId);
  }
  getNodeById(id: string, nodes: INode[]) {
    return nodes.find((n) => n.id === id);
  }
  async executeWf(webhookId: string, payload: any) {
    const wf = this.getWf(webhookId);
    if (!wf) return payload;

    const triggerNode = this.getNodeByWebhookId(webhookId, wf.nodes);
    const queue: { node: INode; payload: any }[] = [];
    if (triggerNode) queue.push({ node: triggerNode, payload });

    while (queue.length > 0) {
      const { node, payload } = queue.shift()!;
      let result: any = payload;

      if (node.type === "GmailNode") {
        result = await this.sendAMessage(node, payload);
      } else if (node.type === "TelegramNode") {
        result = await this.sendATextMessage(node, payload);
      } else if (node.type === "AgentNode") {
        result = await this.executeAgent(node, payload, wf);
      }

      const payloadToSend = {
        id: node.webhookId,
        data: { ...result },
      };
      this.listenerManager.emit(webhookId, {
        type: "webhook_event",
        payload: payloadToSend,
      });

      const connections = wf.connections[node.id];
      if (connections && connections.main && connections.main[0]) {
        for (const child of connections.main[0]) {
          const childNode = this.getNodeById(child.id, wf.nodes);
          if (childNode) {
            queue.push({ node: childNode, payload: result });
          }
        }
      }
    }
  }

  async executeAgent(node: INode, payload: any, wf: WorkflowType) {
    const connections = wf.connections[node.id];

    const llms = [];
    const tools = [];

    const prompt = node.parameters.prompt;
    if (connections && connections.main && connections.main[0]) {
      for (const child of connections.main[0]) {
        const childNode = this.getNodeById(child.id, wf.nodes);
        if (childNode?.type === "Gemini" || childNode?.type === "OpenAI") {
          llms.push(childNode);
        } else if (childNode?.type === "CodeTool") {
          tools.push(childNode);
        }
      }
    }
  }
  async sendATextMessage(node: INode, payload: any) {
    const id = node.parameters.credentials[0].id;
    const cred = await prisma.credential.findFirst({
      where: {
        id,
      },
    });
    if (!cred || !cred.data) return;
    const data = cred.data as any;
    const accessToken = data.accessToken as string;

    const chatId = Mustache.render(node.parameters.chatId, payload);

    const message = Mustache.render(node.parameters.message, payload);
    const res = await axios.post(
      `https://api.telegram.org/bot${accessToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
      }
    );

    return res.data;
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

    const to = Mustache.render(node.parameters.to, payload);
    const subject = Mustache.render(node.parameters.subject, payload);
    const message = Mustache.render(node.parameters.message, payload);

    const mailOptions = {
      to: to,
      subject: subject,
      html: message,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
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
