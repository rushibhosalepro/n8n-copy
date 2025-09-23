"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const Create = () => {
  const router = useRouter();
  const createNewWorkFlow = async () => {
    try {
      const response = await api.get("/create");
      const { projectId } = response.data;
      if (!projectId) throw new Error("error creating new workflow");

      router.push(`/workflow/${projectId}`);
    } catch (error) {}
  };

  const createCredential = () => {
    router.push("/home/credentials?create=true");
  };
  return (
    <div className="flex items-center w-max">
      <Button
        onClick={createNewWorkFlow}
        className="bg-[#ff6f5c]  cursor-pointer hover:bg-[#ff5a44] text-white rounded-r-none pr-1  border-r border-r-white"
      >
        Create Workflow
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger className="p-0" asChild>
          <Button
            variant="ghost"
            className="bg-[#ff6f5c] hover:bg-[#ff5a44]  text-white px-2 rounded-l-none cursor-pointer"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-md shadow-md">
          <DropdownMenuItem
            className="cursor-pointer text-base"
            onClick={createCredential}
          >
            Create Credentials
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Create;
