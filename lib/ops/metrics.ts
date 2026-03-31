import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

type Sql = NeonQueryFunction<false, false>;

function getSql(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

async function scalarCount(sql: Sql, query: string): Promise<number | null> {
  try {
    const rows = (await sql.query(query)) as Array<{ count: number }>;
    return Number(rows[0]?.count ?? 0);
  } catch {
    return null;
  }
}

export interface OpsSnapshot {
  databaseConfigured: boolean;
  inventoryRows: number | null;
  financeSubmissions: number | null;
  financeDeadLetter: number | null;
  webhookReceived: number | null;
  webhookFailed: number | null;
  crmSent: number | null;
  crmDeadLetter: number | null;
}

export async function getOpsSnapshot(): Promise<OpsSnapshot> {
  const sql = getSql();
  if (!sql) {
    return {
      databaseConfigured: false,
      inventoryRows: null,
      financeSubmissions: null,
      financeDeadLetter: null,
      webhookReceived: null,
      webhookFailed: null,
      crmSent: null,
      crmDeadLetter: null,
    };
  }

  const [
    inventoryRows,
    financeSubmissions,
    financeDeadLetter,
    webhookReceived,
    webhookFailed,
    crmSent,
    crmDeadLetter,
  ] = await Promise.all([
    scalarCount(sql, 'SELECT COUNT(*)::int AS count FROM inventory_vehicles'),
    scalarCount(sql, 'SELECT COUNT(*)::int AS count FROM finance_submissions'),
    scalarCount(
      sql,
      "SELECT COUNT(*)::int AS count FROM finance_submissions WHERE status = 'dead_letter'",
    ),
    scalarCount(sql, 'SELECT COUNT(*)::int AS count FROM webhook_events'),
    scalarCount(
      sql,
      "SELECT COUNT(*)::int AS count FROM webhook_events WHERE status = 'failed'",
    ),
    scalarCount(
      sql,
      "SELECT COUNT(*)::int AS count FROM crm_dispatch_log WHERE status = 'sent'",
    ),
    scalarCount(
      sql,
      'SELECT COUNT(*)::int AS count FROM crm_dispatch_log WHERE dead_letter = TRUE',
    ),
  ]);

  return {
    databaseConfigured: true,
    inventoryRows,
    financeSubmissions,
    financeDeadLetter,
    webhookReceived,
    webhookFailed,
    crmSent,
    crmDeadLetter,
  };
}
