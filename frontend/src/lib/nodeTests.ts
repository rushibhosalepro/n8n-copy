import api from "@/lib/api";
import { INode } from "@/schema";

export const run = async (node: INode) => {
  try {
    const res = await api.post("/run", {
      node,
    });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const testWebhookTrigger = (data: any) => {};
