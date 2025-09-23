import ReactFlowUI from "@/components/ReactFlowUI";
import api from "@/lib/api";
import { headers } from "next/headers";

interface Props {
  params: Promise<{ workflowId: string }>;
}
const WorkflowPage = async ({ params }: Props) => {
  const { workflowId } = await params;

  const response = await api.get(`/workflow/${workflowId}`, {
    headers: { cookie: (await headers()).get("cookie") || "" },
  });
  const { wf, workflowData } = await response.data;

  console.log(workflowData);

  return (
    <main className="max-w-7xl mx-auto p-4 min-h-screen">
      <ReactFlowUI wf={{ ...wf, ...workflowData }} />
    </main>
  );
};

export default WorkflowPage;
