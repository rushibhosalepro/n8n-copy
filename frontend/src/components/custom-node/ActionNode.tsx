import { INode } from "@/schema";
import { Handle, Position } from "@xyflow/react";

const ActionNode = ({ data }: { data: INode }) => {
  return (
    <div className="min-w-[60px] text-[8px] font-semibold bg-[#f9fafb] shadow-sm px-4 h-[30px] border border-[#2c2c2c] rounded-[6px] flex items-center justify-center">
      {data.name}
      <Handle id="target" type="target" position={Position.Left} />
      <Handle id="source" type="source" position={Position.Right} />
    </div>
  );
};

export default ActionNode;
