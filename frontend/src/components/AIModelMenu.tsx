import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIMOdelType, NodesType } from "@/schema";
import { FC } from "react";

const aiModels: { label: string; value: AIMOdelType }[] = [
  { label: "Gemini", value: "Gemini" },
  { label: "OpenAI", value: "OpenAI" },
];
interface Props {
  open: boolean;
  onSelect: (nodeType: NodesType) => void;
}
const AIModelMenu: FC<Props> = ({ open, onSelect }) => {
  return (
    <Select open={open} onValueChange={(value) => onSelect(value as NodesType)}>
      <SelectTrigger className="min-w-[200px]">
        <SelectValue placeholder="llm" />
      </SelectTrigger>
      <SelectContent>
        {aiModels.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AIModelMenu;
