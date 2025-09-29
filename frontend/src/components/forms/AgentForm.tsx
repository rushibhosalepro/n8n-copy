import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INode } from "@/schema";
import { WorkflowState } from "@/types";
import { Bot, Loader } from "lucide-react";
import { FC, useState } from "react";

interface AgentProps {
  prevNode?: INode | null;
  webhookId: string;
  state: WorkflowState;
  updateState: (newState: WorkflowState) => void;
  runData: Record<string, any>;
  initialValues?: {
    prompt?: string;
  };
  execute: () => void;
  onChange?: (values: { prompt: string }) => void;
}
const AgentForm: FC<AgentProps> = ({
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
  const [formValues, setFormValues] = useState({
    prompt: initialValues?.prompt || [],
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
            <Bot className="w-5 h-5" />
            <h2 className="text-lg font-extrabold">AI Agent</h2>
          </div>
          {state !== "running" && (
            <Button onClick={testHandler} size="sm">
              Execute step
            </Button>
          )}
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label className="font-bold text-sm">Prompt(user message)</Label>
            <Textarea
              value={formValues.prompt}
              onChange={(e) => updateField("prompt", e.target.value)}
              required
              placeholder="you are agent"
              className="h-20 resize-none"
            />
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
  );
};

export default AgentForm;
