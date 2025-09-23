"use client";

import ToggleWorkflowState from "@/components/ToggleWorkflowState";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
interface Props {}

const Workflows: FC<Props> = () => {
  const [wfs, setWfs] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/workflows");
      setWfs(res.data);
    };
    fetchData();
  }, []);
  const handleSwitchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="mt-10">
      <ul className="space-y-4 mt-5">
        {wfs &&
          wfs.map((wf) => {
            return (
              <li key={wf.id} className="bg-[#ddd] border p-6 rounded-lg">
                <Link
                  href={`/workflow/${wf.id}`}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h2 className=" text-sm font-medium mb-1">{wf.name}</h2>
                    <p className="text-xs">
                      Last updated -
                      <span className="ml-2">
                        {formatDistanceToNow(new Date(wf.updatedAt!), {
                          addSuffix: true,
                        })}
                      </span>
                    </p>
                  </div>

                  <ToggleWorkflowState
                    initalstate={wf.active}
                    projectId={wf.id}
                  />
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default Workflows;
