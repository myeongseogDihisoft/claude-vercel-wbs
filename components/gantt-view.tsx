'use client';

import { useRef, useState, type MouseEvent } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import type { TaskNode } from '@/lib/tasks/queries';
import { isOverdue } from '@/lib/tasks/overdue';
import { GanttBar } from './gantt-bar';

const LEFT_PANE_PX = 352; // 22rem
const WEEK_PX = 96; // 6rem

type Props = {
  tasks: TaskNode[];
};

type FlatRow = {
  node: TaskNode;
  depth: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function flatten(nodes: TaskNode[], depth = 0, acc: FlatRow[] = []): FlatRow[] {
  for (const node of nodes) {
    acc.push({ node, depth });
    if (node.children.length > 0) flatten(node.children, depth + 1, acc);
  }
  return acc;
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Monday-aligned start of the week containing `d`.
function startOfWeek(d: Date): Date {
  const base = startOfDay(d);
  const day = base.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
}

function formatMonthDay(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function computeTimeline(rows: FlatRow[], today: Date): { start: Date; end: Date } {
  const dates: Date[] = [];
  for (const { node } of rows) {
    if (node.startDate) dates.push(parseLocalDate(node.startDate));
    if (node.dueDate) dates.push(parseLocalDate(node.dueDate));
  }

  let min: Date;
  let max: Date;
  if (dates.length === 0) {
    min = new Date(today.getTime() - 14 * DAY_MS);
    max = new Date(today.getTime() + 14 * DAY_MS);
  } else {
    min = new Date(Math.min(...dates.map((d) => d.getTime())));
    max = new Date(Math.max(...dates.map((d) => d.getTime())));
  }

  if (today.getTime() < min.getTime()) min = today;
  if (today.getTime() > max.getTime()) max = today;

  const start = startOfWeek(min);
  const endWeek = startOfWeek(max);
  const end = new Date(endWeek.getTime() + WEEK_MS);
  return { start, end };
}

function buildWeekColumns(start: Date, end: Date): Date[] {
  const cols: Date[] = [];
  for (let t = start.getTime(); t < end.getTime(); t += WEEK_MS) {
    cols.push(new Date(t));
  }
  return cols;
}

export function GanttView({ tasks }: Props) {
  const rows = flatten(tasks);
  const today = startOfDay(new Date());
  const { start: timelineStart, end: timelineEnd } = computeTimeline(rows, today);
  const weekCols = buildWeekColumns(timelineStart, timelineEnd);
  const totalMs = timelineEnd.getTime() - timelineStart.getTime();
  const todayLeft = ((today.getTime() - timelineStart.getTime()) / totalMs) * 100;

  const LEFT_PANE_WIDTH = '22rem';
  const ROW_HEIGHT = '2rem';
  const WEEK_WIDTH = '6rem';
  const trackWidth = `calc(${WEEK_WIDTH} * ${weekCols.length})`;
  const trackPxWidth = weekCols.length * WEEK_PX;

  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; label: string } | null>(null);

  const scrollToStartDate = (startISO: string | null) => {
    if (!startISO || !scrollRef.current) return;
    const start = parseLocalDate(startISO);
    const offsetPx = ((start.getTime() - timelineStart.getTime()) / totalMs) * trackPxWidth;
    scrollRef.current.scrollLeft = Math.max(0, LEFT_PANE_PX + offsetPx - 16);
  };

  const handleTrackHover = (e: MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < 0 || x > trackPxWidth) {
      setHoverInfo(null);
      return;
    }
    const ratio = x / trackPxWidth;
    const ms = timelineStart.getTime() + ratio * totalMs;
    const d = new Date(ms);
    setHoverInfo({ x, label: formatMonthDay(d) });
  };

  return (
    <Box ref={scrollRef} borderWidth="1px" borderColor="gray.200" borderRadius="md" overflowX="auto">
      <Flex
        align="stretch"
        minWidth={`calc(${LEFT_PANE_WIDTH} + ${trackWidth})`}
      >
        <Box width={LEFT_PANE_WIDTH} flexShrink={0} borderRightWidth="1px" borderColor="gray.200">
          <Flex
            height={`calc(${ROW_HEIGHT} * 2)`}
            align="center"
            px={3}
            bg="gray.50"
            borderBottomWidth="1px"
            borderColor="gray.200"
            fontSize="xs"
            color="gray.600"
          >
            <Box flex="1">작업</Box>
            <Box width="3rem" textAlign="right">진행률</Box>
          </Flex>
          {rows.map(({ node, depth }) => {
            const overdue = isOverdue(node.dueDate, node.status);
            return (
              <Flex
                key={node.id}
                position="relative"
                height={ROW_HEIGHT}
                align="center"
                px={3}
                borderBottomWidth="1px"
                borderColor="gray.100"
                cursor={node.startDate ? 'pointer' : 'default'}
                _hover={node.startDate ? { bg: 'gray.50' } : undefined}
                onClick={() => scrollToStartDate(node.startDate)}
              >
                {overdue && (
                  <Box
                    position="absolute"
                    left={0}
                    top={0}
                    bottom={0}
                    width="3px"
                    bg="red.500"
                    aria-label="지남"
                  />
                )}
                <Box flex="1" pl={`${depth * 1.25}rem`} minW={0}>
                  <Text truncate fontSize="sm">{node.title}</Text>
                </Box>
                <Box width="3rem" textAlign="right">
                  <Text fontSize="sm" color="gray.600">{node.progress}%</Text>
                </Box>
              </Flex>
            );
          })}
        </Box>

        <Box
          ref={trackRef}
          position="relative"
          flex="1"
          minWidth={trackWidth}
          onMouseMove={handleTrackHover}
          onMouseLeave={() => setHoverInfo(null)}
        >
          <Flex
            height={ROW_HEIGHT}
            bg="gray.50"
            borderBottomWidth="1px"
            borderColor="gray.100"
          >
            {(() => {
              const spans: { key: string; label: string; count: number }[] = [];
              let cur: (typeof spans)[number] | null = null;
              weekCols.forEach((c) => {
                const key = `${c.getFullYear()}-${c.getMonth()}`;
                if (!cur || cur.key !== key) {
                  cur = { key, label: `${c.getFullYear()}년 ${c.getMonth() + 1}월`, count: 1 };
                  spans.push(cur);
                } else {
                  cur.count++;
                }
              });
              return spans.map((m, i) => (
                <Flex
                  key={m.key}
                  width={`calc(${WEEK_WIDTH} * ${m.count})`}
                  align="center"
                  px={2}
                  borderRightWidth={i === spans.length - 1 ? 0 : '1px'}
                  borderColor="gray.100"
                  fontSize="xs"
                  color="gray.600"
                  fontWeight="semibold"
                >
                  {m.label}
                </Flex>
              ));
            })()}
          </Flex>
          <Flex
            height={ROW_HEIGHT}
            bg="gray.50"
            borderBottomWidth="1px"
            borderColor="gray.200"
          >
            {weekCols.map((col, i) => (
              <Flex
                key={col.toISOString()}
                width={WEEK_WIDTH}
                align="center"
                justify="flex-start"
                px={2}
                borderRightWidth={i === weekCols.length - 1 ? 0 : '1px'}
                borderColor="gray.200"
                fontSize="xs"
                color="gray.600"
              >
                {formatMonthDay(col)}
              </Flex>
            ))}
          </Flex>

          {rows.map(({ node }) => {
            const hasRange = node.startDate && node.dueDate;
            const overdue = isOverdue(node.dueDate, node.status);
            return (
              <Box
                key={node.id}
                position="relative"
                height={ROW_HEIGHT}
                borderBottomWidth="1px"
                borderColor="gray.100"
                cursor={node.startDate ? 'pointer' : 'default'}
                onClick={() => scrollToStartDate(node.startDate)}
              >
                {overdue && (
                  <Box
                    position="absolute"
                    inset={0}
                    pointerEvents="none"
                    bgImage="repeating-linear-gradient(45deg, transparent 0, transparent 6px, rgba(239,68,68,0.1) 6px, rgba(239,68,68,0.1) 10px)"
                  />
                )}
                {weekCols.map((col, i) => (
                  <Box
                    key={col.toISOString()}
                    position="absolute"
                    top={0}
                    bottom={0}
                    left={`calc(${WEEK_WIDTH} * ${i})`}
                    width={WEEK_WIDTH}
                    borderRightWidth={i === weekCols.length - 1 ? 0 : '1px'}
                    borderColor="gray.100"
                  />
                ))}

                {hasRange ? (
                  <GanttBar
                    start={parseLocalDate(node.startDate as string)}
                    end={parseLocalDate(node.dueDate as string)}
                    progress={node.progress}
                    timelineStart={timelineStart}
                    timelineEnd={timelineEnd}
                    status={node.status}
                    isOverdue={overdue}
                  />
                ) : (
                  <Flex position="absolute" inset={0} align="center" pl={3}>
                    <Text fontSize="sm" color="gray.500">— 일정 없음 —</Text>
                  </Flex>
                )}
              </Box>
            );
          })}

          <Box
            position="absolute"
            top={0}
            bottom={0}
            left={`${todayLeft}%`}
            width="0"
            borderLeftWidth="1px"
            borderLeftStyle="dashed"
            borderLeftColor="gray.400"
            pointerEvents="none"
            aria-label="오늘"
          >
            <Text
              position="absolute"
              top="2px"
              left="4px"
              fontSize="2xs"
              fontWeight="semibold"
              color="gray.600"
              whiteSpace="nowrap"
              lineHeight="1"
            >
              오늘 {today.getMonth() + 1}/{today.getDate()}
            </Text>
          </Box>

          {hoverInfo && (
            <Box
              position="absolute"
              top={0}
              bottom={0}
              left={`${hoverInfo.x}px`}
              width="0"
              borderLeftWidth="1px"
              borderLeftStyle="dotted"
              borderLeftColor="gray.300"
              pointerEvents="none"
              zIndex={3}
            >
              <Text
                position="absolute"
                top="2px"
                left="4px"
                px="1"
                py="0.5"
                bg="gray.700"
                color="white"
                fontSize="2xs"
                fontWeight="semibold"
                borderRadius="sm"
                whiteSpace="nowrap"
                lineHeight="1"
              >
                {hoverInfo.label}
              </Text>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
