import Create from "@/components/credentials/Create";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCredential } from "@/lib/getCredentials";
import { INode } from "@/schema";
import { WorkflowState } from "@/types";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";

interface GmailProps {
  prevNode?: INode | null;
  webhookId: string;
  state: WorkflowState;
  updateState: (newState: WorkflowState) => void;
  runData: Record<string, any>;
  initialValues?: {
    credentials?: { name: string; id: string }[];
    resource?: string;
    operation?: string;
    to?: string;
    subject?: string;
    message?: string;
  };
  execute: () => void;
  onChange?: (values: {
    credentials: { name: string; id: string }[];
    resource: string;
    operation: string;
    to: string;
    subject: string;
    message: string;
  }) => void;
}

const Gmail = ({
  state,
  updateState: setState,
  initialValues,
  onChange,
  execute,
  runData,
  webhookId,
  prevNode,
}: GmailProps) => {
  const [availableCreds, setAvailableCreds] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    credentials: initialValues?.credentials || [],
    resource: initialValues?.resource || "",
    operation: initialValues?.operation || "",
    to: initialValues?.to || "",
    subject: initialValues?.subject || "",
    message: initialValues?.message || "",
  });
  const prevNodeEvents = runData[prevNode?.webhookId as string];
  const nodeEvents = runData[webhookId];

  const updateField = (field: keyof typeof formValues, value: any) => {
    const updated = { ...formValues, [field]: value };
    setFormValues(updated);
    if (onChange) onChange(updated);
  };

  useEffect(() => {
    const getCreds = async () => {
      const creds = await getCredential("GmailNode");
      setAvailableCreds(creds);
      if (!formValues.credentials.length && creds.length) {
        updateField("credentials", [creds[0]]);
      }
    };
    getCreds();
  }, []);

  const testHandler = async () => {
    try {
      setState("running");
      execute();
    } catch {
      setState("error");
    }
  };

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
                {state === "running" && <Loader />} Execure previous nodes
              </Button>
              <span>(From the earliest node that needs it)</span>
            </>
          )}
        </div>
        <div className="max-w-[400px] w-full flex flex-col overflow-y-auto h-full shadow-sm rounded-xl border p-4">
          <div className="pb-4 border-b mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <h2 className="text-lg font-extrabold">Send a message</h2>
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
                    setSelectedNode("GmailNode");
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
                <SelectContent className="space-y-4 p-2">
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
              <Label className="font-bold text-sm">Resource</Label>
              <Select
                required
                onValueChange={(val) => updateField("resource", val)}
                value={formValues.resource}
              >
                <SelectTrigger className="w-full text-left border p-2 rounded-sm font-medium text-xs">
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent className="space-y-4 p-2">
                  <SelectItem value="message">Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Operation</Label>
              <Select
                required
                onValueChange={(val) => updateField("operation", val)}
                value={formValues.operation}
              >
                <SelectTrigger className="w-full text-left border p-2 rounded-sm font-medium text-xs">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent className="space-y-4 p-2">
                  <SelectItem value="send">Send</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">To</Label>
              <Input
                required
                type="email"
                placeholder="john@gmail.com"
                value={formValues.to}
                onChange={(e) => updateField("to", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Subject</Label>
              <Input
                required
                type="text"
                placeholder="eg. approval required"
                value={formValues.subject}
                onChange={(e) => updateField("subject", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Message</Label>
              <Textarea
                required
                placeholder="eg. approval required"
                className="h-32 resize-none"
                value={formValues.message}
                onChange={(e) => updateField("message", e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Gmail;
