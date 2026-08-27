"use client";

import dagre from "@dagrejs/dagre";
import {
  Background,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useRouter } from "next/navigation";
import type { LocalGenealogy, Mathematician } from "@/types/genealogy";
import "@xyflow/react/dist/style.css";

type MathematicianNodeData = { mathematician: Mathematician; isSubject: boolean };
const nodeWidth = 218;
const nodeHeight = 76;

function MathematicianNode({ data }: NodeProps<Node<MathematicianNodeData>>) {
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <article className={`genealogy-node ${data.isSubject ? "genealogy-node--subject" : ""}`}>
        <strong>{data.mathematician.name}</strong>
        <span>{data.mathematician.university ?? "University unknown"}{data.mathematician.degreeYear ? ` · ${data.mathematician.degreeYear}` : ""}</span>
      </article>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </>
  );
}

const nodeTypes = { mathematician: MathematicianNode };

function layoutGraph(genealogy: LocalGenealogy) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "TB", nodesep: 42, ranksep: 74, marginx: 28, marginy: 28 });
  const people = [...genealogy.advisors, genealogy.subject, ...genealogy.students];

  people.forEach((mathematician) => graph.setNode(mathematician.id, { width: nodeWidth, height: nodeHeight }));
  genealogy.relationships.forEach((relationship) => graph.setEdge(relationship.advisorId, relationship.studentId));
  dagre.layout(graph);

  const nodes: Node<MathematicianNodeData>[] = people.map((mathematician) => {
    const position = graph.node(mathematician.id) as { x: number; y: number };
    return {
      id: mathematician.id,
      type: "mathematician",
      data: { mathematician, isSubject: mathematician.id === genealogy.subject.id },
      position: { x: position.x - nodeWidth / 2, y: position.y - nodeHeight / 2 },
    };
  });

  const edges: Edge[] = genealogy.relationships.map((relationship) => ({
    id: `${relationship.advisorId}-${relationship.studentId}`,
    source: relationship.advisorId,
    target: relationship.studentId,
    type: "straight",
  }));

  return { nodes, edges };
}

export function GenealogyGraph({ genealogy }: { genealogy: LocalGenealogy }) {
  const router = useRouter();
  const { nodes, edges } = layoutGraph(genealogy);

  return (
    <section className="genealogy" aria-labelledby="genealogy-heading">
      <div className="genealogy__heading">
        <h2 id="genealogy-heading">Academic genealogy</h2>
        <p>{genealogy.advisors.length} advisor{genealogy.advisors.length === 1 ? "" : "s"} · {genealogy.students.length} immediate student{genealogy.students.length === 1 ? "" : "s"}</p>
      </div>
      <div className="genealogy__canvas">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.3 }} minZoom={0.5} maxZoom={1.4} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} onNodeClick={(_, node) => router.push(`/mathematician/${node.id}`)}>
          <Background gap={20} size={1} color="#e8e7e2" />
        </ReactFlow>
      </div>
    </section>
  );
}