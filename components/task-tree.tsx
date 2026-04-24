'use client';

import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import type { TaskNode } from '@/lib/tasks/queries';
import { TaskRow } from './task-row';

type Props = {
  tasks: TaskNode[];
};

type FlatRow = {
  node: TaskNode;
  depth: number;
  hasChildren: boolean;
};

function flatten(nodes: TaskNode[], expanded: Set<string>, depth = 0, acc: FlatRow[] = []): FlatRow[] {
  for (const node of nodes) {
    const hasChildren = node.children.length > 0;
    acc.push({ node, depth, hasChildren });
    if (hasChildren && expanded.has(node.id)) {
      flatten(node.children, expanded, depth + 1, acc);
    }
  }
  return acc;
}

function collectIdsWithChildren(nodes: TaskNode[], acc: Set<string> = new Set()): Set<string> {
  for (const node of nodes) {
    if (node.children.length > 0) {
      acc.add(node.id);
      collectIdsWithChildren(node.children, acc);
    }
  }
  return acc;
}

export function TaskTree({ tasks }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => collectIdsWithChildren(tasks));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rows = flatten(tasks, expanded);

  return (
    <Box borderWidth="1px" borderColor="gray.200" borderRadius="md">
      {rows.map(({ node, depth, hasChildren }) => (
        <TaskRow
          key={node.id}
          task={node}
          depth={depth}
          hasChildren={hasChildren}
          expanded={expanded.has(node.id)}
          onToggle={() => toggle(node.id)}
        />
      ))}
    </Box>
  );
}
