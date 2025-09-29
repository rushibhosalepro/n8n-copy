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
import { Textarea } from "@/components/ui/textarea";
import { INode } from "@/schema";
import { WorkflowState } from "@/types";
import { CodeXml, Loader } from "lucide-react";
import { FC, useState } from "react";

interface OpenAIFormProps {
  prevNode?: INode | null;
  webhookId: string;
  state: WorkflowState;
  updateState: (newState: WorkflowState) => void;
  runData: Record<string, any>;
  initialValues?: {
    description?: string;
    language?: string;
    code?: string;
  };
  execute: () => void;
  onChange?: (values: {
    description: string;
    language: string;
    code: string;
  }) => void;
}

const availableLanguages = [{ id: "javascript", name: "JavaScript" }];

const ToolForm: FC<OpenAIFormProps> = ({
  state,
  prevNode,
  execute,
  runData,
  updateState: setState,
  webhookId,
  initialValues,
  onChange,
}) => {
  const prevNodeEvents = runData[prevNode?.webhookId as string];
  const nodeEvents = runData[webhookId];
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const [formValues, setFormValues] = useState({
    description: initialValues?.description || "",
    language: initialValues?.language || "",
    code: initialValues?.code || "",
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
              <CodeXml className="w-5 h-5" />
              <h2 className="text-lg font-extrabold">Code Tool</h2>
            </div>
            {state !== "running" && (
              <Button onClick={testHandler} size="sm">
                Execute step
              </Button>
            )}
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-sm">Description</Label>
              <Textarea
                value={formValues.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="call this tool to get random color."
                className="h-30 resize-none"
              ></Textarea>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Language</Label>
              <Select
                onValueChange={(val) => updateField("language", val)}
                value={formValues.language}
              >
                <SelectTrigger className="w-full text-left border p-2 rounded-sm font-medium text-xs">
                  <SelectValue placeholder={availableLanguages[0].name} />
                </SelectTrigger>
                <SelectContent className="space-y-2 p-2">
                  {availableLanguages.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">{formValues.language}</Label>
              <Textarea
                value={formValues.code}
                onChange={(e) => updateField("code", e.target.value)}
                placeholder="// Example: convert the incoming query to uppercase and return it
return query.toUpperCase()."
                className="h-30 resize-none"
              ></Textarea>
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

export default ToolForm;
