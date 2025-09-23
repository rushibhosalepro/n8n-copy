"use client";

import GeminiCredForm from "@/components/credentials/GeminiCredForm";
import GmailCredForm from "@/components/credentials/GmailCredForm";
import OpenAICredForm from "@/components/credentials/OpenAICredForm";
import TelegramCredForm from "@/components/credentials/TelegramCredForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { FC, useState } from "react";

interface Props {
  onClose: () => void;
}

const credentialNodes = [
  "GmailNode",
  "TelegramNode",
  "OpenAINode",
  "GeminiNode",
];

const AvailableForms = {
  GmailNode: GmailCredForm,
  TelegramNode: TelegramCredForm,
  OpenAINode: OpenAICredForm,
  GeminiNode: GeminiCredForm,
};

type AvailableFormKey = keyof typeof AvailableForms;

const DEFUALT_NAMES = {
  GmailNode: "Gmail Account",
  TelegramNode: "Telegram Account",
  OpenAINode: "OpenAI Account",
  GeminiNode: "Gemini Account",
};
type AvailableNamesKey = keyof typeof DEFUALT_NAMES;

const NewCredential: FC<Props> = ({ onClose }) => {
  const [selectedNode, setSelectedNode] = useState<AvailableFormKey | null>(
    null
  );

  const SelectedForm = selectedNode ? AvailableForms[selectedNode] : null;

  const saveCredential = async (nodeType: string, data: any) => {
    const name = nodeType as AvailableNamesKey;
    try {
      await api.post("/credentials", {
        type: nodeType,
        data,
        name: DEFUALT_NAMES[name],
      });
      onClose();
    } catch (err) {
      console.error("Failed to save credential", err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {!SelectedForm && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-[30%] h-[30%] rounded-lg shadow-xl border border-gray-200 p-6 overflow-y-auto"
        >
          <h2 className="text-2xl font-semibold mb-2">Add new credentials</h2>
          <p className="text-gray-600 mb-8">
            Select an app or service to connect to
          </p>

          <div className="w-full">
            <Select
              onValueChange={(val) => setSelectedNode(val as AvailableFormKey)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {credentialNodes.map((node) => (
                  <SelectItem key={node} value={node}>
                    {node.replace("Node", "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {SelectedForm && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="z-[99] bg-white w-[50%] h-[50%] rounded-lg shadow-xl border border-gray-200 p-6 overflow-y-auto"
        >
          <SelectedForm
            onClose={onClose}
            onSave={(data) => saveCredential(selectedNode!, data)}
          />
        </div>
      )}
    </div>
  );
};

export default NewCredential;
