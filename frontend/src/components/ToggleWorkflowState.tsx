import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import { FC, useState } from "react";

interface Props {
  initalstate: boolean;
  projectId: string;
}
const ToggleWorkflowState: FC<Props> = ({ initalstate, projectId }) => {
  const [active, setActive] = useState(initalstate);

  const onActiveStateChange = async (
    newState: boolean,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setActive(newState);
    try {
      await api.patch(`/workflow/${projectId}`, {
        active: newState,
      });
    } catch (error) {
      console.error("Failed to update workflow state", error);
      setActive(!newState);
    }
  };
  return (
    <div
      className="flex items-center space-x-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Label htmlFor="active" className="text-[#555]">
        {active ? "Active" : "Inactive"}
      </Label>
      <Switch
        id="active"
        checked={active}
        className="cursor-pointer  data-[state=unchecked]:bg-[#666]"
        onCheckedChange={onActiveStateChange}
      />
    </div>
  );
};

export default ToggleWorkflowState;
