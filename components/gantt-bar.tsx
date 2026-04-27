import { Box } from '@chakra-ui/react';

type Props = {
  start: Date;
  end: Date;
  progress: number;
  timelineStart: Date;
  timelineEnd: Date;
  status: string;
  isOverdue?: boolean;
};

const TRACK_BG: Record<string, string> = {
  todo: 'gray.100',
  doing: 'blue.100',
  blocked: 'orange.100',
  done: 'green.100',
};

const FILL_BG: Record<string, string> = {
  todo: 'gray.400',
  doing: 'blue.500',
  blocked: 'orange.500',
  done: 'green.500',
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function formatMD(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function GanttBar({
  start,
  end,
  progress,
  timelineStart,
  timelineEnd,
  status,
  isOverdue = false,
}: Props) {
  const totalMs = timelineEnd.getTime() - timelineStart.getTime();
  if (totalMs <= 0) return null;

  const startMs = Math.max(start.getTime(), timelineStart.getTime());
  const endMs = Math.max(startMs, Math.min(end.getTime(), timelineEnd.getTime()));

  const left = clampPercent(((startMs - timelineStart.getTime()) / totalMs) * 100);
  const width = clampPercent(((endMs - startMs) / totalMs) * 100);
  const fill = clampPercent(progress);

  const trackBg = isOverdue ? 'red.100' : TRACK_BG[status] ?? 'blue.100';
  const fillBg = isOverdue ? 'red.500' : FILL_BG[status] ?? 'blue.500';

  const dateLabel = `${formatMD(start)} ~ ${formatMD(end)} · ${fill}%`;

  return (
    <Box
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
      left={`${left}%`}
      width={`${width}%`}
      minWidth="2px"
      height="1.25rem"
      bg={trackBg}
      borderRadius="sm"
      overflow="hidden"
      userSelect="none"
      aria-label={`간트 막대 ${dateLabel}`}
      title={dateLabel}
      {...(isOverdue && { borderWidth: '1px', borderColor: 'red.500' })}
    >
      <Box width={`${fill}%`} height="100%" bg={fillBg} />
    </Box>
  );
}
