#!/usr/bin/env node
/**
 * Build wrapper: runs 'next build' and strips the cosmetic deprecation warning
 * about middleware.ts vs proxy.ts.
 *
 * Root cause: Next.js 16.2.1 Turbopack registers 'middleware.ts' correctly
 * (middleware manifest populated, Clerk edge auth works). 'proxy.ts' is the
 * intended Next.js 16 filename but the Turbopack Rust core does not register it
 * — the middleware manifest stays empty and Clerk never runs on the edge.
 * The warning is cosmetic. This wrapper produces a clean, warning-free build.
 */
const { spawn } = require('child_process');
const path = require('path');

const SUPPRESS = [
  'The "middleware" file convention is deprecated. Please use "proxy" instead.',
  'Learn more: https://nextjs.org/docs/messages/middleware-to-proxy',
];

const root = path.resolve(__dirname, '..');
const nextBin = path.resolve(root, 'node_modules/.bin/next');

const child = spawn(nextBin, ['build'], {
  cwd: root,
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe'],
});

function filterAndWrite(dest, data) {
  const lines = data.toString().split('\n');
  const filtered = lines
    .filter((line) => !SUPPRESS.some((s) => line.includes(s)))
    .join('\n');
  if (filtered !== '') dest.write(filtered);
}

child.stdout.on('data', (data) => filterAndWrite(process.stdout, data));
child.stderr.on('data', (data) => filterAndWrite(process.stderr, data));
child.on('close', (code) => process.exit(code ?? 0));
