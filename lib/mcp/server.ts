// WBS MCP 서버 정의 — 5개 Task CRUD tool 등록.
// mcp-handler 의 createMcpHandler 가 McpServer 인스턴스를 callback 으로 넘겨주므로
// 여기서는 register 헬퍼만 export 한다 (route.ts 에서 호출).

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  createTaskHandler,
  createTaskInputShape,
  deleteTaskHandler,
  deleteTaskInputShape,
  getTaskHandler,
  getTaskInputShape,
  listTasksHandler,
  listTasksInputShape,
  updateTaskHandler,
  updateTaskInputShape,
} from './tools/tasks';

export const WBS_MCP_SERVER_INFO = {
  name: 'wbs-mcp',
  version: '0.1.0',
} as const;

/**
 * 주어진 McpServer 인스턴스에 5개 Task tool 을 등록한다.
 * mcp-handler `createMcpHandler((server) => registerWbsTools(server), ...)` 패턴용.
 */
export function registerWbsTools(server: McpServer): void {
  server.registerTool(
    'list_tasks',
    {
      title: 'List Tasks',
      description: 'WBS Task 전체 목록을 createdAt 오름차순으로 반환합니다.',
      inputSchema: listTasksInputShape,
    },
    listTasksHandler,
  );

  server.registerTool(
    'get_task',
    {
      title: 'Get Task',
      description: 'id 로 단건 Task를 조회합니다.',
      inputSchema: getTaskInputShape,
    },
    getTaskHandler,
  );

  server.registerTool(
    'create_task',
    {
      title: 'Create Task',
      description:
        '새 WBS Task를 생성합니다. title 필수. parent_id 지정 시 하위 작업으로 만듭니다.',
      inputSchema: createTaskInputShape,
    },
    createTaskHandler,
  );

  server.registerTool(
    'update_task',
    {
      title: 'Update Task',
      description:
        'Task의 일부 필드를 갱신합니다. progress=100 이면 status가 자동으로 done이 됩니다.',
      inputSchema: updateTaskInputShape,
    },
    updateTaskHandler,
  );

  server.registerTool(
    'delete_task',
    {
      title: 'Delete Task',
      description: 'id 로 Task를 삭제합니다 (자식은 FK ON DELETE CASCADE로 함께 삭제).',
      inputSchema: deleteTaskInputShape,
    },
    deleteTaskHandler,
  );
}

