"use client";

import Gmail from "@/components/forms/Gmail";
import OnFormSubmission from "@/components/forms/OnFormSubmission";
import onWebhook from "@/components/forms/onWebhook";
import Telegram from "@/components/forms/Telegram";
import { getPreviousNode } from "@/lib/execution";
import { WorkflowType } from "@/schema";
import { WorkflowState } from "@/types";
import { Node } from "@xyflow/react";

import { FC } from "react";

interface Props {
  state: WorkflowState;
  updateState: (newState: WorkflowState) => void;
  onFormClose: () => void;
  node: Node | null;
  workFlow: WorkflowType;
  execute: () => void;
  onUpdate: (data: any) => void;
  runData: Record<string, any>;
}

const AvailableForms = {
  OnFormSubmissionTrigger: OnFormSubmission,
  WebhookTrigger: onWebhook,
  GmailNode: Gmail,
  TelegramNode: Telegram,
};
type AvailableFormKey = keyof typeof AvailableForms;

const Form: FC<Props> = ({
  onFormClose,
  node,
  state,
  updateState,
  onUpdate,
  execute,
  runData,
  workFlow,
}) => {
  if (!node) return;

  const type = node.data.type as AvailableFormKey;
  const parameters = node.data.parameters ?? {};
  const SelectedForm = AvailableForms[type];
  const prevNode = getPreviousNode(workFlow, node.data.id as string);

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-[50]"
      onClick={onFormClose}
    >
      <div
        className="bg-white w-[90%] h-[90%] rounded-lg shadow-xl border border-gray-200 p-6 overflow-y-auto z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-full">
          {SelectedForm ? (
            <SelectedForm
              updateState={updateState}
              state={state}
              prevNode={prevNode}
              runData={runData}
              webhookId={node.data.webhookId as string}
              initialValues={parameters}
              execute={execute}
              onChange={(values) => {
                onUpdate({
                  ...node,
                  data: {
                    ...node.data,
                    parameters: values,
                  },
                });
              }}
            />
          ) : (
            <p className="text-xl font-medium">
              This node does not have any parameters
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;
