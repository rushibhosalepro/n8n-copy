import { INode } from "@/schema";
import { Handle, Position } from "@xyflow/react";
import { Bot } from "lucide-react";

const AgentNode = ({ data }: { data: INode }) => {
  return (
    <div className="relative min-w-[80px] h-[60px] text-[8px] font-semibold bg-[#f9fafb] shadow-sm px-4 border border-[#2c2c2c] rounded-[6px] flex flex-col items-center justify-center">
      <p className="flex items-center gap-1 mb-1">
        <Bot className="w-4 h-4" /> {data.name}
      </p>

      <Handle id="in-main" type="target" position={Position.Left} />

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ left: "30%" }}
        id="out-llm"
      />
      <div
        className="absolute bottom-[-10px] text-[5px]"
        style={{ left: "30%", transform: "translateX(-50%)" }}
      >
        LLM
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ left: "70%" }}
        id="out-tools"
      />
      <div
        className="absolute bottom-[-10px] text-[5px]"
        style={{ left: "70%", transform: "translateX(-50%)" }}
      >
        TOOLS
      </div>

      <Handle id="out-main" type="source" position={Position.Right} />
    </div>
  );
};

export default AgentNode;
