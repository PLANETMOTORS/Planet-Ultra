#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROUTES = [
  '/',
  '/inventory',
  '/finance',
  '/purchase',
  '/protection',
  '/sell-or-trade',
  '/how-it-works',
  '/about',
  '/faq',
  '/locations',
  '/reviews',
  '/delivery',
  '/returns',
  '/compare',
  '/contact',
  '/blog',
  '/blog/how-to-buy-used-car-online-ontario',
  '/blog/trade-in-vs-private-sale',
  '/blog/vehicle-protection-plans-explained',
  '/sign-in',
  '/sign-up',
  '/account',
  '/saved',
  '/profile',
  '/admin',
];

const ATTEMPTS = Number(process.env.AUDIT_ATTEMPTS || '3');
const THRESHOLD_MS = Number(process.env.AUDIT_THRESHOLD_MS || '200');

const targetLocal = {
  name: 'local',
  baseUrl: process.env.AUDIT_LOCAL_BASE_URL || 'http://localhost:4031',
};

const targetDev = {
  name: 'dev',
  baseUrl: process.env.AUDIT_DEV_BASE_URL || 'https://dev.planetmotors.ca',
};

const targetMode = process.env.AUDIT_TARGETS || 'local,dev';
const targets = targetMode
  .split(',')
  .map((v) => v.trim().toLowerCase())
  .filter(Boolean)
  .map((name) => (name === 'local' ? targetLocal : targetDev));

function nowMs() {
  return Number(process.hrtime.bigint()) / 1e6;
}

function toPercent(part, total) {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

function isoStampCompact(date) {
  return date.toISOString().replace(/[:.]/g, '-');
}

async function probeRoute(baseUrl, route) {
  const samplesMs = [];
  let status = 0;
  for (let i = 0; i < ATTEMPTS; i += 1) {
    const t0 = nowMs();
    const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });
    const t1 = nowMs();
    status = response.status;
    samplesMs.push(Math.round(t1 - t0));
  }

  const avgMs = Math.round(samplesMs.reduce((a, b) => a + b, 0) / samplesMs.length);
  const maxMs = Math.max(...samplesMs);
  const speedPass = avgMs < THRESHOLD_MS;
  const statusPass = status >= 200 && status < 400;

  return {
    route,
    status,
    samplesMs,
    avgMs,
    maxMs,
    speedPass,
    statusPass,
    strictPass: speedPass && statusPass,
  };
}

async function runTarget(target) {
  const rows = [];
  for (const route of ROUTES) {
    rows.push(await probeRoute(target.baseUrl, route));
  }

  const total = rows.length;
  const speedPassCount = rows.filter((r) => r.speedPass).length;
  const statusPassCount = rows.filter((r) => r.statusPass).length;
  const strictPassCount = rows.filter((r) => r.strictPass).length;
  const failures = rows.filter((r) => !r.strictPass);

  return {
    target: target.name,
    baseUrl: target.baseUrl,
    thresholdMs: THRESHOLD_MS,
    attempts: ATTEMPTS,
    totals: {
      routes: total,
      speedPassCount,
      statusPassCount,
      strictPassCount,
    },
    passRate: {
      speedPercent: toPercent(speedPassCount, total),
      statusPercent: toPercent(statusPassCount, total),
      strictPercent: toPercent(strictPassCount, total),
    },
    rows,
    failures,
  };
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# Site Performance Audit');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push(`- Threshold: < ${report.thresholdMs}ms`);
  lines.push(`- Attempts per route: ${report.attempts}`);
  lines.push(`- Routes audited: ${report.routesAudited}`);
  lines.push('');

  for (const target of report.targets) {
    lines.push(`## ${target.target.toUpperCase()} (${target.baseUrl})`);
    lines.push('');
    lines.push(`- Speed pass: ${target.totals.speedPassCount}/${target.totals.routes} (${target.passRate.speedPercent}%)`);
    lines.push(`- Status pass: ${target.totals.statusPassCount}/${target.totals.routes} (${target.passRate.statusPercent}%)`);
    lines.push(`- Strict pass: ${target.totals.strictPassCount}/${target.totals.routes} (${target.passRate.strictPercent}%)`);
    lines.push('');

    if (target.failures.length === 0) {
      lines.push('All routes passed strict checks.');
      lines.push('');
      continue;
    }

    lines.push('| Route | Status | Avg ms | Max ms | Issue |');
    lines.push('|---|---:|---:|---:|---|');
    for (const f of target.failures) {
      const issues = [];
      if (!f.statusPass) issues.push(`status ${f.status}`);
      if (!f.speedPass) issues.push(`avg ${f.avgMs}ms`);
      lines.push(`| \`${f.route}\` | ${f.status} | ${f.avgMs} | ${f.maxMs} | ${issues.join(', ')} |`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const generatedAt = new Date();
  const targetResults = [];

  for (const target of targets) {
    targetResults.push(await runTarget(target));
  }

  const report = {
    generatedAt: generatedAt.toISOString(),
    thresholdMs: THRESHOLD_MS,
    attempts: ATTEMPTS,
    routesAudited: ROUTES.length,
    targets: targetResults,
  };

  const outDir = join(process.cwd(), 'docs', 'evidence', 'performance');
  mkdirSync(outDir, { recursive: true });

  const stamp = isoStampCompact(generatedAt);
  const base = `site-performance-audit-${stamp}`;
  const jsonPath = join(outDir, `${base}.json`);
  const mdPath = join(outDir, `${base}.md`);

  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeFileSync(mdPath, renderMarkdown(report));

  console.log(`[audit] JSON: ${jsonPath}`);
  console.log(`[audit] MD:   ${mdPath}`);
  for (const target of targetResults) {
    console.log(
      `[audit] ${target.target}: speed=${target.passRate.speedPercent}% status=${target.passRate.statusPercent}% strict=${target.passRate.strictPercent}%`,
    );
  }
}

main().catch((error) => {
  console.error('[audit] fatal:', error);
  process.exit(1);
});
