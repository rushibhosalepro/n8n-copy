"use client";
import ActionNodeMenu from "@/components/ActionNodeMenu";
import ActionNode from "@/components/custom-node/ActionNode";
import AgentNode from "@/components/custom-node/AgentNode";
import NullNode from "@/components/custom-node/NullNode";
import TriggerNode from "@/components/custom-node/TriggerNode";
import Form from "@/components/forms/Form";
import TriggerNodeMenu from "@/components/TriggerNodeMenu";
import WorkflowHeader from "@/components/WorkflowHeader";
import useSocket from "@/hooks/useSocket";
import { createNode, generateId } from "@/lib/createNode";
import { executeWorkflow } from "@/lib/execution";
import { NodesType, WorkflowType } from "@/schema";
import { WorkflowState } from "@/types";
import {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  Node,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { debounce } from "lodash";
import { FC, useCallback, useEffect, useState } from "react";

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  null: NullNode,
  agent: AgentNode,
};

const nullNode = {
  id: "1",
  type: "null",
  position: { x: 0, y: 0 },
  data: {},
};

interface FlowContentProps {
  wId: string;
  workflow: WorkflowType;
  setWorkflow: React.Dispatch<React.SetStateAction<WorkflowType>>;
}
const FlowContent: FC<FlowContentProps> = ({ wId, workflow, setWorkflow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [configurationNode, setConfigurationNode] = useState<null | Node>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [runData, setRunData] = useState<Record<string, any>>({});

  const [state, setState] = useState<WorkflowState>("idle");

  const { isReady, sendMessage, socket } = useSocket();

  const [showAndOpenTriggerNodeMenu, setShowAndOpenTriggerNodeMenu] =
    useState(false);

  const [pendingConnection, setPendingConnection] = useState<{
    fromNodeId: string;
    position: { x: number; y: number };
  } | null>(null);

  const [showAndOpenActionNodeMenu, setShowAndOpenActionNodeMenu] =
    useState(false);

  const updateState = (newState: WorkflowState) => {
    setState(newState);
  };
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: any) => {
      console.log(`handler msgs`, msg);
      try {
        const data = JSON.parse(msg.data);

        if (data.type === "webhook_event" && data.payload) {
          const webhookId = String(data.payload.id);

          setRunData((prev) => ({
            ...prev,
            [webhookId]: data.payload,
          }));
        } else if (data.type === "execution_completed") {
          setState("completed");
        }
      } catch (err) {
        setState("error");
        console.error("Invalid WS message", err);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  useEffect(() => {
    if (!workflow?.nodes) return;
    const initialNodes = workflow.nodes.map((node) => createNode(node));

    setNodes(initialNodes);

    const initialEdges: Edge[] = [];
    Object.entries(workflow.connections).forEach(([sourceId, conn]) => {
      conn.main.forEach((branch) => {
        branch.forEach((targetNodeInfo) => {
          const targetNode = initialNodes.find(
            (n) => n.data.id === targetNodeInfo.id
          );
          if (targetNode) {
            initialEdges.push({
              id: `e${sourceId}-${targetNode.id}`,
              source: sourceId,
              target: targetNode.id,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                orient: "auto-start-reverse",
              },
            });
          }
        });
      });
    });
    setEdges(initialEdges);
  }, [workflow]);

  const onConnect = useCallback((params: Connection) => {
    const sourceId = params.source;
    const targetId = params.target;
    setWorkflow((prev) => {
      const prevMain = prev.connections[sourceId]?.main || [[]];
      const targetNode = prev.nodes.filter((n) => n.id === targetId)[0];
      if (!targetNode) return prev;
      const updatedMain = [...prevMain];
      if (!updatedMain[0]) updatedMain[0] = [];

      updatedMain[0] = [
        ...updatedMain[0],
        {
          id: targetNode.id,
          name: targetNode.name,
          index: 0,
        },
      ];

      return {
        ...prev,
        connections: {
          ...prev.connections,
          [sourceId]: {
            main: updatedMain,
          },
        },
      };
    });

    setEdges((els) =>
      addEdge(
        {
          ...params,

          markerEnd: {
            type: MarkerType.ArrowClosed,
            orient: "auto-start-reverse",
          },
        },
        els
      )
    );
  }, []);

  const handleNodeClick = (evt: React.MouseEvent, node: Node) => {
    if (node.type === "null") {
      setShowAndOpenTriggerNodeMenu(true);
    } else {
      setConfigurationNode(node);
    }
  };

  const onTriggerNodeItemClicked = (type: NodesType) => {
    const newNode = createNode({
      type,
      position: [0, 0],
      webhookId: generateId(),
    });

    setNodes((prev) => [...prev, newNode]);

    setWorkflow((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode.data],
    }));
    setConfigurationNode(newNode);
    setShowAndOpenTriggerNodeMenu(false);
  };
  const onActionNodeItemClicked = (type: NodesType) => {
    const pos = pendingConnection?.position ?? { x: 0, y: 0 };

    const newNode = createNode({
      type,
      position: [pos.x, pos.y],
      webhookId: generateId(),
    });
    setWorkflow((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode.data],
    }));

    setNodes((prev) => [...prev, newNode]);

    if (pendingConnection) {
      setEdges((eds) =>
        eds.concat({
          id: `e${pendingConnection.fromNodeId}-${newNode.id}`,
          source: pendingConnection.fromNodeId,
          target: newNode.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            orient: "auto-start-reverse",
          },
        })
      );
      setWorkflow((prev) => {
        const sourceId = pendingConnection.fromNodeId;

        const prevMain = prev.connections[sourceId]?.main || [[]];

        const updatedMain = [...prevMain];
        if (!updatedMain[0]) updatedMain[0] = [];

        updatedMain[0] = [
          ...updatedMain[0],
          {
            id: newNode.id,
            name: newNode.data.name,
            index: 0,
          },
        ];

        return {
          ...prev,
          connections: {
            ...prev.connections,
            [sourceId]: {
              main: updatedMain,
            },
          },
        };
      });

      setPendingConnection(null);
    }

    setConfigurationNode(newNode);
    setShowAndOpenActionNodeMenu(false);
  };

  const handleNodeDragStop = (_evt: React.MouseEvent, node: Node) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === node.id
          ? {
              ...n,
              data: {
                ...n.data,
                position: [node.position.x, node.position.y],
              },
            }
          : n
      )
    );
    setWorkflow((prev) => {
      return {
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === node.data.id
            ? {
                ...n,

                position: [node.position.x, node.position.y],
              }
            : n
        ),
      };
    });
  };

  const onConnectEnd = useCallback(
    (event: any, connectionState: any) => {
      if (!connectionState.isValid) {
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;

        const pos = screenToFlowPosition({ x: clientX, y: clientY });

        setPendingConnection({
          fromNodeId: connectionState.fromNode.id,
          position: pos,
        });

        setShowAndOpenActionNodeMenu(true);
      }
    },
    [screenToFlowPosition]
  );

  const debouncedUpdateNodes = useCallback(
    debounce((updatedNode: Node) => {
      const { parameters, credentials } = updatedNode.data;
      setNodes((prev) =>
        prev.map((n) => (n.id === updatedNode.id ? updatedNode : n))
      );

      setWorkflow((prev) => {
        return {
          ...prev,
          nodes: prev.nodes.map((n) =>
            n.id === updatedNode.data.id
              ? {
                  ...n,
                  credentials: undefined,
                  parameters: parameters ?? {},
                }
              : n
          ),
        };
      });
    }, 500),
    [setNodes]
  );

  useEffect(() => {
    return () => {
      debouncedUpdateNodes.cancel?.();
    };
  }, [debouncedUpdateNodes]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <TriggerNodeMenu
            onSelect={onTriggerNodeItemClicked}
            open={showAndOpenTriggerNodeMenu}
          />

          <ActionNodeMenu
            onSelect={onActionNodeItemClicked}
            open={showAndOpenActionNodeMenu}
          />
        </div>
      </div>
      {configurationNode && (
        <Form
          state={state}
          updateState={updateState}
          workFlow={workflow}
          runData={runData}
          node={configurationNode}
          onUpdate={(updatedNode) => {
            setConfigurationNode(updatedNode);
            debouncedUpdateNodes(updatedNode);
          }}
          execute={(prev?: boolean) => {
            if (!configurationNode) return;
            if (isReady) {
              // const parameters = configurationNode.data.parameters as {
              //   path?: string;
              // };

              // const path = parameters?.path
              //   ? parameters.path
              //   : configurationNode.data.webhookId;

              // sendMessage(
              //   JSON.stringify({
              //     type: "subscribe",
              //     webhookId: path,
              //   })
              // );
              executeWorkflow(workflow, {
                sendMessage,
                destinationNodeId: configurationNode.data.id as string,
                runUpToPrevious: prev,
              });
            }
          }}
          onFormClose={() => {
            setConfigurationNode(null);
          }}
        />
      )}
      <div style={{ width: "100%", height: "90vh" }} className="border">
        <ReactFlow
          nodes={nodes.length === 0 ? [nullNode] : nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={handleNodeDragStop}
          fitView
          onConnectEnd={onConnectEnd}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={(evt, node) => {}}
          defaultViewport={{ x: 0, y: 0, zoom: 1.2 }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

const ReactFlowUI = ({ wf }: { wf: WorkflowType }) => {
  const [workflow, setWorkflow] = useState<WorkflowType>({
    name: wf.name,
    id: wf.id,
    active: wf.active,
    nodes: wf.nodes ?? [],
    connections: wf.connections ?? {},
  });

  const updateWorkflow = (newWf: WorkflowType) => {
    setWorkflow((prev) => ({
      ...prev,
      ...newWf,
    }));
  };
  return (
    <ReactFlowProvider>
      <div className="flex flex-col gap-2">
        <WorkflowHeader wf={workflow} setWorkFlow={updateWorkflow} />
        <FlowContent
          wId={wf.id}
          workflow={workflow}
          setWorkflow={setWorkflow}
        />
      </div>
    </ReactFlowProvider>
  );
};

export default ReactFlowUI;
