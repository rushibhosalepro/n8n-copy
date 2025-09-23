"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash } from "lucide-react";
import { FC, useState } from "react";

interface Props {
  onSave: (data: any) => void;
  onClose: () => void;
}
const TelegramCredForm: FC<Props> = ({ onClose, onSave }) => {
  const [accessToken, setAccessToken] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.telegram.org");
  const saveData = () => {
    if (!accessToken || !baseUrl) {
      alert("access token and base url reuired");
      return;
    }
    onSave({ accessToken, baseUrl });
  };
  return (
    <div className="p-4 w-full ">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Send className="w-12 h-12 text-[#ff6f5c]" />
          <div>
            <h2 className="text-xl font-semibold">Telegram account</h2>
            <p className="text-sm text-gray-500">Telegram API</p>
          </div>
        </div>
        <div className="flex items-center gap-4 justify-between">
          <Trash className="w-5 h-5 text-[#ff6f5c] cursor-pointer" />

          <Button
            onClick={saveData}
            className="bg-blue-500 hover:bg-blue-600 text-white mt-4 w-full"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4">
        <label className="text-sm font-medium">Access Token</label>
        <Input
          className="w-full"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="Enter bot access token"
        />

        <label className="text-sm font-medium">Base URL</label>
        <Input
          className="w-full"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="Enter base URL (optional)"
        />
      </div>
    </div>
  );
};

export default TelegramCredForm;
