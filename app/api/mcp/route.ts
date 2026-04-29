// Streamable HTTP MCP 엔드포인트 — Issue #48.
// mcp-handler 1.x basePath 규약: basePath='/api' + 기본 streamableHttpEndpoint='/mcp'
// → 결과 라우트 URL 은 정확히 '/api/mcp'.
// 참고: node_modules/mcp-handler/dist/index.d.ts L80-89 (basePath 의미).
//
// MCP_PUBLIC_ENABLED 안전핀: 환경변수가 '1' 이 아니면 모든 메서드에서 503.
// Vercel Production 에서 의도적으로 켤 때만 응답하도록.

import { createMcpHandler } from 'mcp-handler';
import { NextResponse, type NextRequest } from 'next/server';
import { WBS_MCP_SERVER_INFO, registerWbsTools } from '@/lib/mcp/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const baseHandler = createMcpHandler(
  (server) => {
    registerWbsTools(server);
  },
  {
    serverInfo: WBS_MCP_SERVER_INFO,
    capabilities: { tools: {} },
  },
  {
    basePath: '/api',
    disableSse: true,
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === 'development',
  },
);

function disabledResponse(): Response {
  return NextResponse.json(
    {
      error: 'MCP endpoint disabled',
      hint: 'Set MCP_PUBLIC_ENABLED=1 to enable.',
    },
    { status: 503 },
  );
}

async function guarded(req: NextRequest): Promise<Response> {
  if (process.env.MCP_PUBLIC_ENABLED !== '1') {
    return disabledResponse();
  }
  return baseHandler(req);
}

export { guarded as GET, guarded as POST, guarded as DELETE };
