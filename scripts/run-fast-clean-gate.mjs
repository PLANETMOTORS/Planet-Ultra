#!/usr/bin/env node

import { spawn } from 'node:child_process';

const PORT = Number(process.env.PORT || '4012');
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const THRESHOLD_MS = process.env.PAGE_SPEED_THRESHOLD_MS || '200';
const ATTEMPTS = process.env.PAGE_SPEED_ATTEMPTS || '3';

const QUALITY_STEPS = [
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'typecheck']],
  ['npm', ['test']],
  ['npm', ['run', 'ops:links:check']],
  ['npm', ['run', 'build']],
];

function run(cmd, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      env: { ...process.env, ...extraEnv },
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`Command failed (${code}): ${cmd} ${args.join(' ')}`));
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status >= 200 && res.status < 500) return;
    } catch {
      // keep polling until timeout
    }
    await delay(500);
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms: ${url}`);
}

async function main() {
  console.log('[gate] Running quality/build steps...');
  for (const [cmd, args] of QUALITY_STEPS) {
    await run(cmd, args);
  }

  console.log(`[gate] Starting production server on port ${PORT}...`);
  const server = spawn('npm', ['run', 'start'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) },
  });

  try {
    await waitForServer(BASE_URL);
    console.log('[gate] Running page speed gate...');
    await run(
      'npm',
      ['run', 'ops:perf:pages'],
      {
        BASE_URL,
        PAGE_SPEED_THRESHOLD_MS: THRESHOLD_MS,
        PAGE_SPEED_ATTEMPTS: ATTEMPTS,
      },
    );
    console.log('[gate] PASS: fast + clean checks completed.');
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error('[gate] FAIL:', error.message);
  process.exit(1);
});
