import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionNodesType, NodesType } from "@/schema";
import { FC } from "react";

interface Props {
  open: boolean;
  onSelect: (nodeType: NodesType) => void;
}

const actionOptions: { label: string; value: ActionNodesType }[] = [
  { label: "Gmail", value: "GmailNode" },
  { label: "Agent", value: "AgentNode" },
  { label: "Telegram", value: "TelegramNode" },
  { label: "IF", value: "IfNode" },
];

const ActionNodeMenu: FC<Props> = ({ open, onSelect }) => {
  return (
    <Select open={open} onValueChange={(value) => onSelect(value as NodesType)}>
      <SelectTrigger className="min-w-[200px]">
        <SelectValue placeholder="What happens next" />
      </SelectTrigger>
      <SelectContent>
        {actionOptions.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ActionNodeMenu;
