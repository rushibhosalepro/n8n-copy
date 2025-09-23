import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { config } from "@/config";
import useSocket from "@/hooks/useSocket";
import api from "@/lib/api";
import { Atom, Copy } from "lucide-react";
import { FC, useState } from "react";

const httpMethods = ["GET", "POST"] as const;
type HttpMethod = (typeof httpMethods)[number];

interface OnWebhookProps {
  webhookId: string;
  initialValues?: {
    urls?: string;
    httpMethod?: HttpMethod;
    path?: string;
    auth?: string;
  };
  onChange?: (values: {
    httpMethod: HttpMethod;
    path?: string;
    auth?: string;
  }) => void;
}

const OnWebhook: FC<OnWebhookProps> = ({
  webhookId,
  initialValues,
  onChange,
}) => {
  const { socket, isReady, sendMessage } = useSocket();
  const [copied, setCopied] = useState(false);
  const [payload, setPayload] = useState(null);
  const testURL = `${config.server_url}/webook-test/${webhookId}`;
  const [state, setState] = useState<
    "idle" | "listening" | "completed" | "error"
  >("idle");
  const [formValues, setFormValues] = useState({
    urls: initialValues?.urls || "",
    httpMethod: initialValues?.httpMethod || "GET",
    path: webhookId || "",
    auth: initialValues?.auth || "none",
  });

  const execute = async () => {
    if (!isReady) {
      console.warn("WebSocket not ready yet");
      return;
    }
    try {
      await api.post(`${config.server_url}/run`, {
        webhookId: webhookId,
        nodeData: formValues,
        httpMethod: formValues.httpMethod,
        path: formValues.path,
        auth: formValues.auth,
      });
      sendMessage({ type: "subscribe", webhookId });
      setState("listening");
      socket!.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "webhook_event") setPayload(data.payload);
        setState("completed");
        sendMessage({ type: "unsubscribe", webhookId });
      };
    } catch (err) {
      setState("error");
      console.error("Error executing webhook test:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const updated = { ...formValues, [id]: value };
    setFormValues(updated);
    onChange?.(updated);
  };

  const handleSelectChange = (key: keyof typeof formValues, value: string) => {
    const updated = { ...formValues, [key]: value };
    setFormValues(updated);
    onChange?.(updated);
  };

  const copyToClipboard = () => {
    if (!testURL) return;
    navigator.clipboard.writeText(testURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full h-full flex gap-4">
      <div className="max-w-64   w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 w-full">
          <Button variant="default" onClick={execute}>
            Listen for Test Event
          </Button>
          {state === "listening" && (
            <div className="flex flex-col items-center gap-3 w-full">
              <p className="text-sm font-medium text-gray-600">
                Listening for events…
              </p>
              <div className="flex items-center justify-between w-full bg-gray-100 rounded-xl px-3 py-2">
                <span className="text-xs break-all">{testURL}</span>
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && <p className="text-xs text-green-600">Copied!</p>}
            </div>
          )}
        </div>
      </div>

      <div className="w-96 shadow border rounded-sm p-3 flex-shrink-0">
        <div className="flex items-center justify-between border-b p-2 mb-4">
          <div className="flex items-center gap-1">
            <Atom />
            <h2 className="font-bold text-xl">Webhook</h2>
          </div>
          <Button variant="outline" size="sm" onClick={execute}>
            Listen for Test Event
          </Button>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="block font-semibold text-sm" htmlFor="urls">
              Webhook URL [TEST]
            </label>
            <Input type="text" id="urls" value={testURL} readOnly />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold">HTTP Method</label>
            <Select
              value={formValues.httpMethod}
              onValueChange={(val) => handleSelectChange("httpMethod", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {httpMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="block font-semibold text-sm" htmlFor="path">
              Path
            </label>
            <Input
              id="path"
              type="text"
              value={formValues.path}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold">Auth</label>
            <Select
              value={formValues.auth}
              onValueChange={(val) => handleSelectChange("auth", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="header">Header Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>

      <div className=" w-full border p-3 rounded  overflow-auto">
        <pre className="text-xs text-gray-700">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default OnWebhook;
