import Create from "@/components/credentials/Create";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCredential } from "@/lib/getCredentials";
import { INode } from "@/schema";
import { WorkflowState } from "@/types";
import { Bot, Loader } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface GeminiFormProps {
  prevNode?: INode | null;
  webhookId: string;
  state: WorkflowState;
  updateState: (newState: WorkflowState) => void;
  runData: Record<string, any>;
  initialValues?: {
    credentials?: { name: string; id: string }[];
    model?: string;
  };
  execute: () => void;
  onChange?: (values: {
    credentials: { name: string; id: string }[];
    model: string;
  }) => void;
}

const availableModels = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Free)" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro" },
];

const GeminiForm: FC<GeminiFormProps> = ({
  state,
  prevNode,
  execute,
  runData,
  updateState: setState,
  webhookId,
  initialValues,
  onChange,
}) => {
  const [availableCreds, setAvailableCreds] = useState<
    { id: string; name: string }[]
  >([]);
  const prevNodeEvents = runData[prevNode?.webhookId as string];
  const nodeEvents = runData[webhookId];

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    credentials: initialValues?.credentials || [],
    model: initialValues?.model || "gemini-2.5-pro",
  });

  const updateField = (field: keyof typeof formValues, value: any) => {
    const updated = { ...formValues, [field]: value };
    setFormValues(updated);
    if (onChange) onChange(updated);
  };

  const testHandler = async () => {
    try {
      setState("running");
      execute();
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    const getCreds = async () => {
      const creds = await getCredential("GeminiNode");
      setAvailableCreds(creds);
      if (!formValues.credentials.length && creds.length) {
        updateField("credentials", [creds[0]]);
      }
    };
    getCreds();
  }, []);

  return (
    <>
      <Create
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
      <div className="w-full h-full flex items-center gap-2">
        <div className="max-w-sm w-full h-full flex-col gap-4 flex items-center justify-center">
          {prevNodeEvents ? (
            <div className="flex-1 flex h-full overflow-auto">
              <pre className="whitespace-pre-wrap break-words max-w-sm">
                {prevNodeEvents ? JSON.stringify(prevNodeEvents, null, 2) : "-"}
              </pre>
            </div>
          ) : (
            <>
              <p>No Input data yet</p>
              <Button disabled={state === "running"} onClick={testHandler}>
                {state === "running" && <Loader />} Execute previous nodes
              </Button>
              <span>(From the earliest node that needs it)</span>
            </>
          )}
        </div>
        <div className="max-w-[400px] w-full flex flex-col overflow-y-auto h-full shadow-sm rounded-xl border p-4">
          <div className="pb-4 border-b mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h2 className="text-lg font-extrabold">
                Google Gemini Chat Model
              </h2>
            </div>
            {state !== "running" && (
              <Button onClick={testHandler} size="sm">
                Execute step
              </Button>
            )}
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-sm">
                Credential to connect with
              </Label>
              <Select
                required
                onValueChange={(val) => {
                  if (val === "new") {
                    setSelectedNode("GeminiNode");
                    return;
                  }
                  const selected = availableCreds.find((c) => c.id === val);
                  if (selected) updateField("credentials", [selected]);
                }}
                value={formValues.credentials[0]?.id || ""}
              >
                <SelectTrigger className="w-full text-left border p-2 rounded-sm font-medium text-xs">
                  <SelectValue placeholder="Select credential" />
                </SelectTrigger>
                <SelectContent className="space-y-2 p-2">
                  {availableCreds.map((c) => (
                    <SelectItem value={c.id} key={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Create new credential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Model</Label>
              <Select
                onValueChange={(val) => updateField("model", val)}
                value={formValues.model}
              >
                <SelectTrigger className="w-full text-left border p-2 rounded-sm font-medium text-xs">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent className="space-y-2 p-2">
                  {availableModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <div className="flex-1 flex flex-col h-full p-4 rounded-xl overflow-auto">
          <h3 className="font-semibold text-gray-500 mb-5">Output</h3>
          {nodeEvents && (
            <div className="flex-1 flex h-full">
              <pre className="whitespace-pre-wrap break-words max-w-sm">
                {nodeEvents?.data
                  ? JSON.stringify(nodeEvents.data, null, 2)
                  : "-"}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GeminiForm;
