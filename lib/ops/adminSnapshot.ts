import type { NeonQueryFunction } from '@neondatabase/serverless';
import { getOpsSnapshot, type OpsSnapshot } from '@/lib/ops/metrics';
import { getDatabaseSql } from '@/lib/db/sql';

type Sql = NeonQueryFunction<false, false>;

function getSql(): Sql | null {
  return getDatabaseSql();
}

async function maybeRows(sql: Sql, query: string) {
  try {
    return await sql.query(query);
  } catch {
    return [];
  }
}

export interface AdminOpsSnapshot {
  generatedAt: string;
  core: OpsSnapshot;
  recentFinance: Array<{
    id: string;
    status: string;
    provider: string | null;
    updatedAt: string;
  }>;
  recentWebhooks: Array<{
    provider: string;
    eventType: string;
    status: string;
    createdAt: string;
  }>;
  recentCrmDispatch: Array<{
    source: string;
    eventType: string;
    status: string;
    deadLetter: boolean;
    updatedAt: string;
  }>;
}

export async function getAdminOpsSnapshot(): Promise<AdminOpsSnapshot> {
  const core = await getOpsSnapshot();
  const sql = getSql();
  if (!sql) {
    return {
      generatedAt: new Date().toISOString(),
      core,
      recentFinance: [],
      recentWebhooks: [],
      recentCrmDispatch: [],
    };
  }

  const [financeRows, webhookRows, crmRows] = await Promise.all([
    maybeRows(
      sql,
      `SELECT id::text, status, provider, updated_at::text
       FROM finance_submissions
       ORDER BY updated_at DESC
       LIMIT 20`,
    ),
    maybeRows(
      sql,
      `SELECT provider, event_type, status, created_at::text
       FROM webhook_events
       ORDER BY created_at DESC
       LIMIT 20`,
    ),
    maybeRows(
      sql,
      `SELECT source, event_type, status, dead_letter, updated_at::text
       FROM crm_dispatch_log
       ORDER BY updated_at DESC
       LIMIT 20`,
    ),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    core,
    recentFinance: (financeRows as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id ?? ''),
      status: String(r.status ?? ''),
      provider: r.provider ? String(r.provider) : null,
      updatedAt: String(r.updated_at ?? ''),
    })),
    recentWebhooks: (webhookRows as Array<Record<string, unknown>>).map((r) => ({
      provider: String(r.provider ?? ''),
      eventType: String(r.event_type ?? ''),
      status: String(r.status ?? ''),
      createdAt: String(r.created_at ?? ''),
    })),
    recentCrmDispatch: (crmRows as Array<Record<string, unknown>>).map((r) => ({
      source: String(r.source ?? ''),
      eventType: String(r.event_type ?? ''),
      status: String(r.status ?? ''),
      deadLetter: Boolean(r.dead_letter),
      updatedAt: String(r.updated_at ?? ''),
    })),
  };
}
