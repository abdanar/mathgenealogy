"use client";

import dagre from "@dagrejs/dagre";
import {
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
const nodeWidth = 194;
const nodeHeight = 64;
const studentColumns = 5;

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

function layoutGraph(genealogy: LocalGenealogy): {
  nodes: Node<MathematicianNodeData>[];
  edges: Edge[];
} {
  if (genealogy.students.length > studentColumns) {
    return layoutLargeGenealogy(genealogy);
  }

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "TB", nodesep: 28, ranksep: 70, marginx: 36, marginy: 32 });
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
    type: "smoothstep",
  }));

  return { nodes, edges };
}

function layoutLargeGenealogy(genealogy: LocalGenealogy): {
  nodes: Node<MathematicianNodeData>[];
  edges: Edge[];
} {
  const studentsPerRow = studentColumns;
  const columnGap = 24;
  const rowGap = 32;
  const advisorY = 24;
  const subjectY = 150;
  const studentY = 276;
  const studentGridWidth = studentsPerRow * nodeWidth + (studentsPerRow - 1) * columnGap;
  const centerX = studentGridWidth / 2 - nodeWidth / 2;
  const advisorWidth = Math.max(
    nodeWidth,
    genealogy.advisors.length * nodeWidth + Math.max(0, genealogy.advisors.length - 1) * columnGap,
  );

  const positionedPeople = [
    ...genealogy.advisors.map((mathematician, index) => ({
      mathematician,
      position: {
        x: (studentGridWidth - advisorWidth) / 2 + index * (nodeWidth + columnGap),
        y: advisorY,
      },
    })),
    { mathematician: genealogy.subject, position: { x: centerX, y: subjectY } },
    ...genealogy.students.map((mathematician, index) => ({
      mathematician,
      position: {
        x: index % studentsPerRow * (nodeWidth + columnGap),
        y: studentY + Math.floor(index / studentsPerRow) * (nodeHeight + rowGap),
      },
    })),
  ];

  return {
    nodes: positionedPeople.map(({ mathematician, position }) => ({
      id: mathematician.id,
      type: "mathematician",
      data: { mathematician, isSubject: mathematician.id === genealogy.subject.id },
      position,
    })),
    edges: genealogy.relationships.map((relationship) => ({
      id: `${relationship.advisorId}-${relationship.studentId}`,
      source: relationship.advisorId,
      target: relationship.studentId,
      type: "smoothstep",
    })),
  };
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
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.18, minZoom: 0.68, maxZoom: 1 }} minZoom={0.6} maxZoom={1.25} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} onNodeClick={(_, node) => router.push(`/mathematician?id=${encodeURIComponent(node.id)}`)}>
        </ReactFlow>
      </div>
    </section>
  );
}