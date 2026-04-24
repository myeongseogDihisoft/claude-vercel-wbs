import { Box } from '@chakra-ui/react';

type Props = {
  start: Date;
  end: Date;
  progress: number;
  timelineStart: Date;
  timelineEnd: Date;
  isOverdue?: boolean;
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export function GanttBar({ start, end, progress, timelineStart, timelineEnd, isOverdue = false }: Props) {
  const totalMs = timelineEnd.getTime() - timelineStart.getTime();
  if (totalMs <= 0) return null;

  const startMs = Math.max(start.getTime(), timelineStart.getTime());
  const endMs = Math.max(startMs, Math.min(end.getTime(), timelineEnd.getTime()));

  const left = clampPercent(((startMs - timelineStart.getTime()) / totalMs) * 100);
  const width = clampPercent(((endMs - startMs) / totalMs) * 100);
  const fill = clampPercent(progress);

  return (
    <Box
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
      left={`${left}%`}
      width={`${width}%`}
      minWidth="2px"
      height="1.25rem"
      bg="blue.100"
      borderRadius="sm"
      overflow="hidden"
      userSelect="none"
      aria-label="간트 막대"
      {...(isOverdue && { outline: '2px solid', outlineColor: 'red.500' })}
    >
      <Box width={`${fill}%`} height="100%" bg="blue.500" />
    </Box>
  );
}
