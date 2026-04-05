#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const APP_DIR = join(ROOT, 'app');
const SCAN_DIRS = ['app', 'components', 'lib'].map((dir) => join(ROOT, dir));
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);

function walk(dir, predicate, out = []) {
  const entries = readdirSync(dir);
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, predicate, out);
      continue;
    }
    if (predicate(full)) out.push(full);
  }
  return out;
}

function extname(path) {
  const idx = path.lastIndexOf('.');
  return idx === -1 ? '' : path.slice(idx);
}

function normalizeRouteTemplate(routeFile) {
  let route = relative(APP_DIR, routeFile)
    .replace(/\\/g, '/')
    .replace(/(^|\/)page\.tsx$/, '');
  if (!route) route = '';
  route = `/${route}`.replace(/\/+/g, '/');

  // Remove route groups: /(marketing)/about -> /about
  route = route.replace(/\/\([^)]+\)/g, '');

  if (route === '/index') route = '/';
  if (route === '/page') route = '/';
  if (route === '') route = '/';
  return route.replace(/\/+/g, '/');
}

function templateToRegex(template) {
  const segments = template.split('/').filter(Boolean);
  let pattern = '^';

  if (segments.length === 0) {
    pattern += '/$';
    return new RegExp(pattern);
  }

  for (const seg of segments) {
    pattern += '/';
    if (/^\[\[\.\.\.[^/]+\]\]$/.test(seg)) {
      // Optional catch-all should match both `/sign-in` and `/sign-in/...`
      pattern = pattern.slice(0, -1);
      pattern += '(?:/.*)?';
      break;
    }
    if (/^\[\.\.\.[^/]+\]$/.test(seg)) {
      pattern += '.+';
      continue;
    }
    if (/^\[[^/]+\]$/.test(seg)) {
      pattern += '[^/]+';
      continue;
    }
    pattern += seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  pattern += '/?$';
  return new RegExp(pattern);
}

function extractInternalHrefs(filePath) {
  const src = readFileSync(filePath, 'utf8');
  const hrefRegex = /\bhref\s*=\s*["']([^"']+)["']/g;
  const found = [];
  let match;

  while ((match = hrefRegex.exec(src)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    if (!raw.startsWith('/')) continue;
    if (raw.startsWith('//')) continue;
    if (raw.startsWith('/api/')) continue;

    // Normalize to pathname only (drop query/hash)
    const parsed = new URL(raw, 'https://planetmotors.local');
    const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    found.push({ raw, pathname });
  }

  return found;
}

function main() {
  const routeFiles = walk(
    APP_DIR,
    (file) => file.endsWith('/page.tsx') || file.endsWith('\\page.tsx'),
  );

  const routeTemplates = routeFiles.map(normalizeRouteTemplate);
  const routeMatchers = routeTemplates.map((template) => ({
    template,
    regex: templateToRegex(template),
  }));

  const sourceFiles = SCAN_DIRS.flatMap((dir) =>
    walk(dir, (file) => SOURCE_EXTENSIONS.has(extname(file))),
  );

  const missing = [];
  for (const file of sourceFiles) {
    const hrefs = extractInternalHrefs(file);
    for (const link of hrefs) {
      const matched = routeMatchers.some((m) => m.regex.test(link.pathname));
      if (!matched) {
        missing.push({
          file: relative(ROOT, file),
          href: link.raw,
          pathname: link.pathname,
        });
      }
    }
  }

  const summary = {
    routeTemplates: routeTemplates.length,
    filesScanned: sourceFiles.length,
    missingLinks: missing.length,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (missing.length > 0) {
    console.log('\nMissing internal route targets:');
    for (const item of missing) {
      console.log(`- ${item.file}: href="${item.href}" (pathname "${item.pathname}")`);
    }
    process.exit(1);
  }

  console.log('\n[PASS] Internal links are valid against app routes.');
}

main();
