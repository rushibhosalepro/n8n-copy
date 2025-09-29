import { INode } from "@/schema";
import { Handle, Position } from "@xyflow/react";

const AINode = ({ data }: { data: INode }) => {
  return (
    <div className="flex items-center justify-center flex-col">
      <div className="w-[30px] rounded-full text-[8px] font-semibold bg-[#f9fafb] shadow-sm p-4 h-[30px] border border-[#2c2c2c]  flex items-center justify-center">
        {data.name.charAt(0)}
        <Handle id="target" type="target" position={Position.Top} />
      </div>
      <p className="mt-1 text-[8px] transition-all font-medium text-gray-800 group-hover:text-gray-500">
        {data.name}
      </p>
    </div>
  );
};

export default AINode;
