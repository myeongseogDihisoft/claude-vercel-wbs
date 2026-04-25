export type ImportRow = {
  title: string;
  description: string | null;
  assignee: string | null;
  status: 'todo' | 'doing' | 'done';
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  parentTitle: string | null;
};

export type ExcludedRow = {
  lineNumber: number;
  reason: string;
};

export type ImportWarning = {
  title: string;
  message: string;
};

export type ParseResult = {
  valid: ImportRow[];
  excluded: ExcludedRow[];
};

const STATUS_MAP: Record<string, 'todo' | 'doing' | 'done'> = {
  '할 일': 'todo',
  '진행 중': 'doing',
  완료: 'done',
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

export function parseCsv(csvText: string): ParseResult {
  const lines = csvText.split('\n').map((l) => l.replace(/\r$/, ''));
  const nonEmpty = lines.filter((l) => l.trim());

  if (nonEmpty.length < 2) {
    return { valid: [], excluded: [] };
  }

  const valid: ImportRow[] = [];
  const excluded: ExcludedRow[] = [];

  // index 0 is header, data starts at index 1
  for (let i = 1; i < nonEmpty.length; i++) {
    const lineNumber = i + 1;
    const cols = parseCsvLine(nonEmpty[i]);
    const [titleRaw, description, assignee, statusRaw, progressRaw, startDateRaw, dueDateRaw, parentTitleRaw] = cols;

    if (!titleRaw || !titleRaw.trim()) {
      excluded.push({ lineNumber, reason: '제목 누락' });
      continue;
    }

    const status = STATUS_MAP[statusRaw?.trim() ?? ''] ?? 'todo';
    const progress = Math.min(100, Math.max(0, parseInt(progressRaw ?? '0', 10) || 0));

    const startDate =
      startDateRaw?.trim() && isValidDate(startDateRaw.trim()) ? startDateRaw.trim() : null;
    const dueDate =
      dueDateRaw?.trim() && isValidDate(dueDateRaw.trim()) ? dueDateRaw.trim() : null;

    valid.push({
      title: titleRaw.trim(),
      description: description?.trim() || null,
      assignee: assignee?.trim() || null,
      status,
      progress,
      startDate,
      dueDate,
      parentTitle: parentTitleRaw?.trim() || null,
    });
  }

  return { valid, excluded };
}
