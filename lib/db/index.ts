import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Vercel 배포 시 DATABASE_URL 은 Supabase Transaction pooler(6543) 문자열이다.
// pooler 모드에서는 prepared statement 를 쓸 수 없으므로 prepare: false 필수 (CLAUDE.md §5).
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(client, { schema });
