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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { config } from "@/config";
import useCopy from "@/hooks/useCopy";
import { INode } from "@/schema";
import { WorkflowState } from "@/types";
import { Check, Copy, Star } from "lucide-react";
import { FC, useEffect, useState } from "react";

const httpMethods = ["GET", "POST"] as const;
type HttpMethod = (typeof httpMethods)[number];

interface OnWebhookProps {
  prevNode?: INode | null;
  webhookId: string;
  state: WorkflowState;
  updateState: (newState: WorkflowState) => void;
  runData: Record<string, any>;
  initialValues?: {
    httpMethod?: HttpMethod;
    path?: string;
  };
  execute: () => void;
  onChange?: (values: { httpMethod: HttpMethod; path?: string }) => void;
}

const OnWebhook: FC<OnWebhookProps> = ({
  webhookId,
  initialValues,
  execute,
  runData,
  state,
  updateState: setState,
  onChange,
}) => {
  const nodeEvents = runData[webhookId];

  const [formValues, setFormValues] = useState({
    httpMethod: initialValues?.httpMethod || "GET",
    path: initialValues?.path || webhookId || "",
  });
  const url = `${config.server_url}/webhook-test/${formValues?.path}`;

  const { copied, copyToClipboard } = useCopy(url);
  const updateFormValues = (updated: Partial<typeof formValues>) => {
    const merged = { ...formValues, ...updated };
    setFormValues(merged);
    onChange?.(merged);
  };

  useEffect(() => {
    if (nodeEvents) setState("idle");
  }, [nodeEvents]);
  const testHandler = async () => {
    try {
      setState("running");
      execute();
    } catch (error) {
      setState("error");
    }
  };

  return (
    <div className="flex items-center gap-4 h-full">
      <div className="max-w-[250px] w-full h-full flex-col gap-4 flex items-center justify-center">
        <Button onClick={testHandler} disabled={state === "running"}>
          Listen for test event
        </Button>
        {state === "running" && (
          <>
            <div className="text-xs p-4 rounded-sm bg-gray-200 font-medium flex items-center gap-2">
              <span className="break-all">{url}</span>
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy
                  className="w-5 h-5 cursor-pointer"
                  onClick={copyToClipboard}
                />
              )}
            </div>
            <div>Listening...</div>
          </>
        )}
      </div>

      {/* form */}
      <div className="max-w-[400px] w-full flex flex-col h-full shadow-sm rounded-xl border p-4">
        <div className="pb-4 border-b mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            <h2 className="text-lg font-extrabold">Webhook</h2>
          </div>
          {state !== "running" && (
            <Button onClick={testHandler} size={"sm"}>
              Listen for test event
            </Button>
          )}
        </div>

        <form className="w-full space-y-6">
          <div className="space-y-2">
            <Label className="font-bold text-sm">Webhook URL</Label>
            <div className="text-xs p-4 rounded-sm bg-gray-200 font-medium space-x-2 flex items-center">
              <Button
                onClick={copyToClipboard}
                className="text-xs cursor-pointer"
              >
                GET
              </Button>
              <span className="break-all">{url}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-sm">HTTP Method</Label>
            <Select
              value={formValues.httpMethod}
              onValueChange={(val) =>
                updateFormValues({ httpMethod: val as HttpMethod })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {httpMethods.map((http) => (
                  <SelectItem value={http} key={http}>
                    {http}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-sm">Path</Label>
            <Input
              id="path"
              className="font-semibold text-xs"
              value={formValues.path}
              onChange={(e) => updateFormValues({ path: e.target.value })}
            />
          </div>
        </form>
      </div>

      {/* output */}
      <div className="flex-1 flex flex-col h-full p-4 rounded-xl overflow-auto">
        <h3 className="font-semibold text-gray-500 mb-5">Output</h3>
        {nodeEvents && (
          <div className="flex-1 flex h-full">
            <Table className="w-full table-fixed ">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left  w-md">Headers</TableHead>
                  <TableHead className="text-left  w-[250px]">Params</TableHead>
                  <TableHead className="text-left  w-[250px]">Query</TableHead>
                  <TableHead className="text-left  w-[250px]">Body</TableHead>
                  <TableHead className="text-left  w-[250px]">
                    Webhook URL
                  </TableHead>
                  <TableHead className="text-left  w-[250px]">
                    Execution Mode
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="align-top text-left text-xs">
                    <pre className="whitespace-pre-wrap break-words max-w-sm">
                      {nodeEvents?.headers
                        ? JSON.stringify(nodeEvents.headers, null, 2)
                        : "-"}
                    </pre>
                  </TableCell>

                  <TableCell className="align-top text-left text-xs">
                    <pre className="whitespace-pre-wrap break-words max-w-sm">
                      {nodeEvents?.params
                        ? JSON.stringify(nodeEvents.params, null, 2)
                        : "-"}
                    </pre>
                  </TableCell>

                  <TableCell className="align-top text-left text-xs">
                    <pre className="whitespace-pre-wrap break-words max-w-sm">
                      {nodeEvents?.query
                        ? JSON.stringify(nodeEvents.query, null, 2)
                        : "-"}
                    </pre>
                  </TableCell>

                  <TableCell className="align-top text-left text-xs">
                    <pre className="whitespace-pre-wrap break-words max-w-sm">
                      {nodeEvents?.body
                        ? JSON.stringify(nodeEvents.body, null, 2)
                        : "-"}
                    </pre>
                  </TableCell>

                  <TableCell className="align-top text-left text-xs">
                    <pre className="whitespace-pre-wrap break-words max-w-sm">
                      {nodeEvents?.webhookUrl ?? "-"}
                    </pre>
                  </TableCell>

                  <TableCell className="align-top text-left text-xs">
                    <pre className="whitespace-pre-wrap break-words max-w-sm">
                      {nodeEvents?.executionMode ?? "-"}
                    </pre>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnWebhook;
