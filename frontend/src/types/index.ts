import { WorkflowType } from "@/schema";

export interface ExecutionRequest {
  workflowData: WorkflowType;
  executionMode: "manual" | "trigger";
  startNodes?: string[];
  destinationNode?: string;
  triggerNode?: string;
  runData?: {};
}
