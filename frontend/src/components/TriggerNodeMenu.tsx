import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NodesType, TriggerNodesType } from "@/schema";
import { FC } from "react";

interface Props {
  open: boolean;
  onSelect: (nodeType: NodesType) => void;
}

const triggerOptions: { label: string; value: TriggerNodesType }[] = [
  { label: "Manual Trigger", value: "ManualTrigger" },
  { label: "Form Submission", value: "OnFormSubmissionTrigger" },
  { label: "Webhook", value: "WebhookTrigger" },
];

const TriggerNodeMenu: FC<Props> = ({ open, onSelect }) => {
  return (
    <Select open={open} onValueChange={(value) => onSelect(value as NodesType)}>
      <SelectTrigger className="min-w-[200px]">
        <SelectValue placeholder="What triggers this workflow" />
      </SelectTrigger>
      <SelectContent>
        {triggerOptions.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TriggerNodeMenu;
