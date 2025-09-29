"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NodesType, ToolsType } from "@/schema";
import { FC } from "react";

const tools: { label: string; value: ToolsType }[] = [
  { label: "Code Tool", value: "CodeTool" },
];
interface Props {
  open: boolean;
  onSelect: (nodeType: NodesType) => void;
}
const ToolNodeMenu: FC<Props> = ({ open, onSelect }) => {
  return (
    <Select open={open} onValueChange={(value) => onSelect(value as NodesType)}>
      <SelectTrigger className="min-w-[200px]">
        <SelectValue placeholder="tools" />
      </SelectTrigger>
      <SelectContent>
        {tools.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ToolNodeMenu;
