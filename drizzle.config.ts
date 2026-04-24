import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// 로컬: .env.local 의 DATABASE_URL 을 우선 읽는다.
// CI/CD: 워크플로우에서 env 로 이미 주입되어 있으면 dotenv 는 기존 값을 덮어쓰지 않는다.
config({ path: '.env.local' });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
