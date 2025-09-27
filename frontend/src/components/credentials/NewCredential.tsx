"use client";

import Create from "@/components/credentials/Create";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const NewCredential: FC<Props> = ({ onClose }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  if (selectedNode) {
    return (
      <Create
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[30%] h-[30%] rounded-lg shadow-xl border border-gray-200 p-6 overflow-y-auto"
      >
        <h2 className="text-2xl font-semibold mb-2">Add new credentials</h2>
        <p className="text-gray-600 mb-8">
          Select an app or service to connect to
        </p>

        <div className="w-full">
          <Select onValueChange={(val) => setSelectedNode(val)}>
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
    </div>
  );
};

export default NewCredential;
