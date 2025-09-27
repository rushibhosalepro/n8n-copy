import { INode } from "@/schema";
import { Handle, Position } from "@xyflow/react";
import { Bot } from "lucide-react";

const AgentNode = ({ data }: { data: INode }) => {
  return (
    <div className="min-w-[60px] text-[8px] font-semibold bg-[#f9fafb] shadow-sm px-4 h-[30px] border border-[#2c2c2c] rounded-[6px] flex items-center justify-center">
      <p className="flex items-center gap-1">
        <Bot className="w-4 h-4" /> {data.name}
      </p>
      <Handle id="source" type="source" position={Position.Right} />
      <Handle id="target" type="target" position={Position.Left} />
      <Handle
        id="target1"
        type="target"
        position={Position.Bottom}
        style={{
          left: "30%",
        }}
      />
      <div
        className="absolute bottom-[-10px] text-[5px]"
        style={{ left: "30%", transform: "translateX(-50%)" }}
      >
        LLM
      </div>
      <Handle
        id="target2"
        type="target"
        position={Position.Bottom}
        style={{
          left: "70%",
        }}
      />
      <div
        className="absolute bottom-[-10px] text-[5px]"
        style={{ left: "70%", transform: "translateX(-50%)" }}
      >
        TOOLS
      </div>
    </div>
  );
};

export default AgentNode;
