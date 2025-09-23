"use client";

import OnFormSubmission from "@/components/forms/OnFormSubmission";
import onWebhook from "@/components/forms/onWebhook";
import { Node } from "@xyflow/react";

import { FC } from "react";

interface Props {
  onFormClose: () => void;
  node: Node | null;
  onUpdate: (data: any) => void;
}

const AvailableForms = {
  OnFormSubmissionTrigger: OnFormSubmission,
  WebhookTrigger: onWebhook,
};
type AvailableFormKey = keyof typeof AvailableForms;
const Form: FC<Props> = ({ onFormClose, node, onUpdate }) => {
  if (!node) return;
  console.log(node);
  const type = node.data.type as AvailableFormKey;
  const parameters = node.data.parameters ?? {};
  const SelectedForm = AvailableForms[type];

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onFormClose}
    >
      <div
        className="bg-white w-[90%] h-[90%] rounded-lg shadow-xl border border-gray-200 p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-full">
          {SelectedForm ? (
            <SelectedForm
              webhookId={node.data.webhookId as string}
              initialValues={parameters}
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
