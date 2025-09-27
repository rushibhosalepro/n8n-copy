import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Trash } from "lucide-react";
import { FC, useState } from "react";

interface Props {
  onSave: (data: any) => void;
}
const OpenAICredForm: FC<Props> = ({ onSave }) => {
  const [apiKey, setAPIKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");
  const saveData = () => {
    if (!apiKey || !baseUrl) {
      alert("Api key and base url required");
      return;
    }
    onSave({ apiKey, baseUrl });
  };
  return (
    <div className="p-4 w-full ">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Bot className="w-12 h-12 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold">OpenAi account</h2>
            <p className="text-sm text-gray-500">OpenAi</p>
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
        <label className="text-sm font-medium">API KEY*</label>
        <Input
          className="w-full"
          value={apiKey}
          onChange={(e) => setAPIKey(e.target.value)}
          placeholder="Enter bot access token"
        />

        <label className="text-sm font-medium">Base URL</label>
        <Input
          className="w-full"
          onChange={(e) => setBaseUrl(e.target.value)}
          value={baseUrl}
          placeholder="Enter base URL (optional)"
        />
      </div>
    </div>
  );
};

export default OpenAICredForm;
