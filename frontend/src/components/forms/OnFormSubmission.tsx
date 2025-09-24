import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { config } from "@/config/";
import useCopy from "@/hooks/useCopy";
import { Check, Copy, NotebookPen, Trash2 } from "lucide-react";
import { ChangeEvent, FC, useEffect, useState } from "react";

const inputTypes = [
  "text",
  "email",
  "number",
  "password",
  "url",
  "tel",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "file",
  "checkbox",
  "radio",
  "range",
  "hidden",
];
interface FormFields {
  name: string;
  type: string;
  placeholder: string;
  required: boolean;
}
interface OnFormSubmissionProps {
  webhookId: string;
  nodeEvents: any;
  initialValues?: {
    formTitle?: string;
    formDescription?: string;
    formFields?: FormFields[];
    respondWhen?: string;
  };
  execute: () => void;
  onChange?: (values: {
    formTitle: string;
    formDescription: string;
    respondWhen: string;
    formFields: FormFields[];
  }) => void;
}
const OnFormSubmission: FC<OnFormSubmissionProps> = ({
  execute,
  nodeEvents,
  initialValues,
  webhookId,
  onChange,
}) => {
  const [formValues, setFormValues] = useState({
    formTitle: initialValues?.formTitle || "",
    formDescription: initialValues?.formDescription || "",
    respondWhen: initialValues?.respondWhen || "",
    formFields: initialValues?.formFields || [],
  });
  const [state, setState] = useState<
    "idle" | "listening" | "completed" | "error"
  >("idle");
  const url = `${config.server_url}/form-test/${webhookId}`;

  const { copied, copyToClipboard } = useCopy(url);
  const updateState = (updated: typeof formValues) => {
    setFormValues(updated);
    onChange?.(updated);
  };
  console.log("data", nodeEvents);
  const addFormElement = () => {
    const newElement: FormFields = {
      name: "",
      type: "text",
      placeholder: "",
      required: false,
    };
    updateState({
      ...formValues,
      formFields: [...formValues.formFields, newElement],
    });
  };

  const handleSelectChange = (value: string) => {
    updateState({ ...formValues, respondWhen: value });
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    updateState({ ...formValues, [id]: value });
  };

  const updateFormElement = (
    index: number,
    key: keyof FormFields,
    value: any
  ) => {
    const updatedformFields = [...formValues.formFields];
    updatedformFields[index] = { ...updatedformFields[index], [key]: value };
    updateState({ ...formValues, formFields: updatedformFields });
  };

  const deleteFormElement = (index: number) => {
    const updatedProperties = formValues.formFields.filter(
      (_, i) => i !== index
    );
    updateState({ ...formValues, formFields: updatedProperties });
  };
  useEffect(() => {
    if (nodeEvents) setState("idle");
  }, [nodeEvents]);
  const testHandler = async () => {
    try {
      setState("listening");
      execute();
    } catch (error) {
      setState("error");
    }
  };
  return (
    <div className="flex items-center gap-4 h-full">
      <div className="max-w-[250px] w-full h-full flex-col gap-4 flex items-center justify-center">
        <Button onClick={testHandler} disabled={state === "listening"}>
          Listen for test event
        </Button>
        {state === "listening" && (
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
      <div className="max-w-[400px] w-full flex flex-col h-full shadow-sm rounded-xl border p-4">
        <div className="pb-4 border-b mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NotebookPen className="w-5 h-5" />
            <h2 className="text-lg font-extrabold">On Form Submission</h2>
          </div>
          {state !== "listening" && (
            <Button onClick={testHandler} size={"sm"}>
              Listen for test event
            </Button>
          )}
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="block font-semibold text-sm" htmlFor="title">
              Form Title
            </label>
            <Input
              type="text"
              id="formTitle"
              className="text-gray-600 font-medium"
              placeholder="e.g. Contact Us"
              value={formValues.formTitle}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2 py-4">
            <label
              className="block font-semibold text-sm"
              htmlFor="description"
            >
              Form Description
            </label>
            <Textarea
              className="text-gray-600 font-medium"
              id="formDescription"
              placeholder="Short description about the form"
              value={formValues.formDescription}
              onChange={handleChange}
            />
          </div>

          <div>
            <h2 className="font-semibold text-sm">Form Elements</h2>
            <div className="space-y-4 mt-2">
              {formValues?.formFields.map((property, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() => deleteFormElement(index)}
                    className="absolute top-3  cursor-pointer right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold">
                      Field Name
                    </label>
                    <Input
                      className="font-medium text-gray-600"
                      value={property.name}
                      onChange={(e) =>
                        updateFormElement(index, "name", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold">
                      Element Type
                    </label>
                    <Select
                      value={property.type}
                      onValueChange={(val) =>
                        updateFormElement(index, "type", val)
                      }
                    >
                      <SelectTrigger className="w-full text-gray-600 cursor-pointer font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {inputTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 ">
                    <label className="block text-xs font-semibold">
                      Placeholder
                    </label>
                    <Input
                      className="font-medium text-gray-600"
                      value={property.placeholder}
                      onChange={(e) =>
                        updateFormElement(index, "placeholder", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-xs font-semibold">Required</label>
                    <Switch
                      checked={property.required}
                      onCheckedChange={(checked) =>
                        updateFormElement(index, "required", checked)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={addFormElement}
              className="mt-3 cursor-pointer w-full"
            >
              Add New Element
            </Button>
          </div>
          <div className="space-y-2">
            <label
              className="block font-semibold text-sm"
              htmlFor="respondWhen"
            >
              Respond when
            </label>
            <Select
              value={formValues.respondWhen}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="min-w-[200px] font-medium w-full cursor-pointer text-gray-600">
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formSubmitted">Form is submitted</SelectItem>
                <SelectItem value="workflowFinish">
                  Workflow finishes
                </SelectItem>
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
  );
};

export default OnFormSubmission;
