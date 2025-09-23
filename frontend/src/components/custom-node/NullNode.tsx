import { INode } from "@/schema";
import { Node, NodeProps } from "@xyflow/react";
const NullNode = ({ id, data }: NodeProps<Node<INode>>) => {
  return (
    <div className="flex flex-col pointer-events-auto items-center justify-center group cursor-pointer nopan">
      <div className="w-[40px] h-[40px] flex items-center transition-all justify-center rounded-[6px] border-2 border-dashed border-[#2c2c2c] group-hover:border-[#5c5c5c] group-hover:text-gray-500 text-gray-800 bg-white shadow-sm text-[18px] font-semibold">
        +
      </div>
      <p className="mt-1 text-[8px] transition-all font-medium text-gray-800 group-hover:text-gray-500">
        Add first step
      </p>
    </div>
  );
};

export default NullNode;
