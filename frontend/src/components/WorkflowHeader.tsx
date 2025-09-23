"use client";
import SaveWorkflow from "@/components/SaveWorkflow";
import ToggleWorkflowState from "@/components/ToggleWorkflowState";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { WorkflowType } from "@/schema";
import { FC, useState } from "react";

interface Props {
  wf: WorkflowType;
  setWorkFlow: (wf: WorkflowType) => void;
}

const WorkflowHeader: FC<Props> = ({ wf, setWorkFlow }) => {
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(wf.name);

  return (
    <header className="flex items-center justify-between mb-2  p-4 ">
      <div className="flex items-center">
        <p className="text-gray-500">personal/</p>
        <div className="relative inline-block">
          <h2
            className={`text-base font-semibold ${editName ? "invisible" : ""}`}
            onClick={() => setEditName(true)}
          >
            {name}
          </h2>
          {editName && (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={async () => {
                if (name.trim() === "") {
                  setName(wf.name);
                  return;
                }
                setEditName(false);

                try {
                  const res = await api.patch(`/workflow/${wf.id}`, { name });
                  setWorkFlow(res.data);
                } catch (err) {
                  console.error("Failed to update name", err);
                  setName(wf.name);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              autoFocus
              className="absolute top-0 left-0 w-full h-full p-0 m-0 focus-visible:ring-0 shadow-none border-none outline-none ring-0 bg-transparent  font-semibold"
            />
          )}
        </div>
      </div>
      <div className="flex items-center space-x-10">
        <SaveWorkflow wf={wf} />
        <ToggleWorkflowState initalstate={wf.active} projectId={wf.id} />
      </div>
    </header>
  );
};

export default WorkflowHeader;
