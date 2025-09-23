"use client";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { WorkflowType } from "@/schema";
import { FC, useState } from "react";

interface Props {
  wf: WorkflowType;
}
const SaveWorkflow: FC<Props> = ({ wf }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.patch(`/workflow/${wf.id}`, {
        nodes: wf.nodes,
        connections: wf.connections,
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to update workflow state", error);
    }
  };
  return (
    <Button className="cursor-pointer" disabled={loading} onClick={handleSave}>
      {loading ? "saving..." : "save"}
    </Button>
  );
};

export default SaveWorkflow;
