'use client';

import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
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

  // 작업이 새로 자식을 갖게 되면(예: 5.0 하위 작업 추가 직후) 자동으로 펼친다.
  // 사용자가 명시적으로 접은 노드는 그대로 둔다.
  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const id of collectIdsWithChildren(tasks)) next.add(id);
      return next;
    });
  }, [tasks]);

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
