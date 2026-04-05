#!/usr/bin/env node

/**
 * Page speed + availability gate.
 *
 * Usage:
 *   BASE_URL=https://dev.planetmotors.ca node scripts/check-page-speed.mjs
 *   BASE_URL=http://localhost:3000 PAGE_SPEED_THRESHOLD_MS=200 node scripts/check-page-speed.mjs
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const THRESHOLD_MS = Number(process.env.PAGE_SPEED_THRESHOLD_MS || '150');
const ATTEMPTS = Number(process.env.PAGE_SPEED_ATTEMPTS || '3');

const routes = [
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
];

function nowMs() {
  return Number(process.hrtime.bigint()) / 1e6;
}

async function hit(urlPath) {
  const samples = [];
  let status = 0;
  for (let i = 0; i < ATTEMPTS; i += 1) {
    const t0 = nowMs();
    const response = await fetch(`${BASE_URL}${urlPath}`, { redirect: 'manual' });
    const t1 = nowMs();
    status = response.status;
    samples.push(Math.round(t1 - t0));
  }
  const avgMs = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
  const maxMs = Math.max(...samples);
  const okStatus = status >= 200 && status < 400;
  return { path: urlPath, status, samples, avgMs, maxMs, okStatus };
}

async function run() {
  const results = [];
  for (const route of routes) {
    results.push(await hit(route));
  }

  const failedStatus = results.filter((r) => !r.okStatus);
  const failedSpeed = results.filter((r) => r.avgMs > THRESHOLD_MS);

  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Threshold: ${THRESHOLD_MS}ms average (${ATTEMPTS} attempts per route)`);
  console.log('');
  for (const row of results) {
    console.log(
      `${row.status.toString().padStart(3, ' ')} ${row.avgMs
        .toString()
        .padStart(4, ' ')}ms avg ${row.maxMs.toString().padStart(4, ' ')}ms max  ${row.path}`,
    );
  }

  console.log('');
  console.log(
    `Summary: ${results.length} routes checked | status failures: ${failedStatus.length} | speed failures: ${failedSpeed.length}`,
  );

  if (failedStatus.length > 0 || failedSpeed.length > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error('[check-page-speed] fatal:', error);
  process.exit(1);
});
