'use server';

// Task CRUD Server Action 시그니처 스텁.
// 실제 DB 쿼리 본체는 에픽 5(5.1/5.2/5.2.1/5.3)에서 채운다.
// 변경 성공 후에는 각 action 마지막에 revalidatePath('/') 를 호출해 목록 뷰를 갱신한다.

export type CreateTaskInput = {
  title: string;
  parentId?: string | null;
  description?: string | null;
  assignee?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
};

export type UpdateTaskPatch = Partial<{
  title: string;
  description: string | null;
  assignee: string | null;
  status: 'todo' | 'doing' | 'done';
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  parentId: string | null;
}>;

export async function createTask(_input: CreateTaskInput): Promise<void> {
  // TODO(5.1): insert into tasks, revalidatePath('/')
  throw new Error('createTask: not implemented (will be filled in issue 5.1)');
}

export async function updateTask(_id: string, _patch: UpdateTaskPatch): Promise<void> {
  // TODO(5.2): update tasks set ... where id = ?, revalidatePath('/')
  // progress 100 → status 'done' 자동 동기화 규칙(SPEC.md §3)은 여기서 적용.
  throw new Error('updateTask: not implemented (will be filled in issue 5.2)');
}

export async function deleteTask(_id: string): Promise<void> {
  // TODO(5.3): delete from tasks where id = ? (cascade로 자식도 삭제), revalidatePath('/')
  throw new Error('deleteTask: not implemented (will be filled in issue 5.3)');
}

export async function cycleStatus(_id: string): Promise<void> {
  // TODO(5.2.1): todo → doing → done → todo 순회, revalidatePath('/')
  throw new Error('cycleStatus: not implemented (will be filled in issue 5.2.1)');
}
