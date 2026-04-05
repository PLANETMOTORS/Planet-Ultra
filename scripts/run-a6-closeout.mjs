import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

function loadLocalEnvFiles() {
  const candidates = ['.env.local', '.env'];
  for (const file of candidates) {
    const resolved = path.resolve(process.cwd(), file);
    if (!fs.existsSync(resolved)) {
      continue;
    }
    try {
      process.loadEnvFile(resolved);
      console.log(`[env] loaded ${file}`);
    } catch (error) {
      console.warn(`[env] failed to load ${file}: ${error.message}`);
    }
  }
}

function hasMeaningfulValue(value) {
  return Boolean(value && value.trim() && value !== '...' && !value.includes('...'));
}

function isValidDatabaseUrl(url) {
  if (!hasMeaningfulValue(url)) return false;
  if (
    url.includes('[user]') ||
    url.includes('[password]') ||
    url.includes('[host]') ||
    url.includes('[dbname]')
  ) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateRequiredEnvironment() {
  const required = [
    'DATABASE_URL',
    'CLERK_WEBHOOK_SECRET',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_SECRET_KEY',
    'OPS_API_SECRET',
    'DEALERTRACK_WEBHOOK_SECRET',
    'ROUTEONE_WEBHOOK_SECRET',
    'DELIVERY_WEBHOOK_SECRET',
    'TRADEIN_WEBHOOK_SECRET',
    'AUTORAPTOR_WEBHOOK_SECRET',
  ];

  const issues = [];
  for (const key of required) {
    const value = process.env[key] ?? '';
    if (!hasMeaningfulValue(value)) {
      issues.push(`${key} is missing or placeholder`);
    }
  }

  if (!isValidDatabaseUrl(process.env.DATABASE_URL ?? '')) {
    issues.push('DATABASE_URL is not a valid non-placeholder URL');
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function timestampCompact() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function run(label, cmd, args) {
  const pretty = `${cmd} ${args.join(' ')}`.trim();
  console.log(`\n[run] ${label}`);
  console.log(`$ ${pretty}`);
  const result = spawnSync(cmd, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${pretty}`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function writeMarkdown(filePath, lines) {
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function evaluate(
  reconcile,
  p0Proof,
  opsAlerts,
  securityBaseline,
  crmEvidence,
  inventoryEvidence,
) {
  const p0Verdict = p0Proof?.verdict ?? {};
  const requiredP0 = ['p0_03', 'p0_04', 'p0_05', 'p0_06'];
  const p0Checks = Object.fromEntries(
    requiredP0.map((k) => [k, p0Verdict[k] === 'PASS_CANDIDATE']),
  );
  const p0AllPass = Object.values(p0Checks).every(Boolean);

  const reconcilePass =
    reconcile?.verdict === 'PASS' && Number(reconcile?.criticalMismatchCount ?? 1) === 0;
  const opsAlertsPass = opsAlerts?.verdict === 'PASS';
  const securityPass = securityBaseline?.verdict === 'PASS';
  const crmPass = crmEvidence?.verdict === 'PASS_CANDIDATE';
  const inventoryPass = inventoryEvidence?.verdict === 'PASS_CANDIDATE';

  return {
    reconcilePass,
    p0AllPass,
    opsAlertsPass,
    securityPass,
    crmPass,
    inventoryPass,
    p0Checks,
    readyToCloseA6Core:
      reconcilePass &&
      p0AllPass &&
      opsAlertsPass &&
      securityPass &&
      crmPass &&
      inventoryPass,
  };
}

function main() {
  loadLocalEnvFiles();
  const envOnly = process.argv.includes('--env-only');

  const envCheck = validateRequiredEnvironment();
  if (!envCheck.ok) {
    console.error('A6 closeout env precheck failed. Fix these first:');
    for (const issue of envCheck.issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  if (envOnly) {
    console.log('A6 closeout env precheck passed.');
    return;
  }

  const outDirArg = process.argv[2];
  const outputDir = path.resolve(
    outDirArg || path.join('artifacts', `a6-closeout-${timestampCompact()}`),
  );
  fs.mkdirSync(outputDir, { recursive: true });

  const reconcilePath = path.join(outputDir, 'reconcile.json');
  const p0ProofPath = path.join(outputDir, 'p0-proof-pack.json');
  const inventoryEvidencePath = path.join(outputDir, 'inventory-ingest-evidence.json');
  const crmEvidencePath = path.join(outputDir, 'crm-evidence.json');
  const opsAlertsPath = path.join(outputDir, 'ops-alerts.json');
  const securityPath = path.join(outputDir, 'security-baseline.json');
  const summaryPath = path.join(outputDir, 'a6-closeout-summary.json');
  const summaryMdPath = path.join(outputDir, 'A6_CLOSEOUT_SUMMARY.md');

  run('tests', 'npm', ['run', 'test']);
  run('lint', 'npm', ['run', 'lint']);
  run('typecheck', 'npm', ['run', 'typecheck']);
  run('build', 'npm', ['run', 'build']);

  run('reconcile (strict, require-db)', process.execPath, [
    'scripts/reconcile-runtime-health.mjs',
    reconcilePath,
    '--require-db',
    '--strict',
  ]);
  run('p0 proof-pack (require-db)', process.execPath, [
    'scripts/generate-p0-proof-pack.mjs',
    p0ProofPath,
    '--require-db',
  ]);
  run('inventory evidence (strict, require-db)', process.execPath, [
    'scripts/generate-inventory-ingest-evidence.mjs',
    inventoryEvidencePath,
    '--require-db',
    '--strict',
  ]);
  run('crm evidence (strict, require-db)', process.execPath, [
    'scripts/generate-crm-evidence.mjs',
    crmEvidencePath,
    '--require-db',
    '--strict',
  ]);
  run('ops alerts (strict, require-db)', process.execPath, [
    'scripts/check-ops-alerts.mjs',
    opsAlertsPath,
    '--require-db',
    '--strict',
  ]);
  run('security baseline (require-secrets)', process.execPath, [
    'scripts/security-baseline-check.mjs',
    securityPath,
    '--require-secrets',
  ]);

  const reconcile = readJson(reconcilePath);
  const p0Proof = readJson(p0ProofPath);
  const inventoryEvidence = readJson(inventoryEvidencePath);
  const crmEvidence = readJson(crmEvidencePath);
  const opsAlerts = readJson(opsAlertsPath);
  const securityBaseline = readJson(securityPath);
  const checks = evaluate(
    reconcile,
    p0Proof,
    opsAlerts,
    securityBaseline,
    crmEvidence,
    inventoryEvidence,
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    outputDir,
    checks,
    reconcile,
    p0ProofVerdict: p0Proof.verdict,
    inventoryEvidenceVerdict: inventoryEvidence.verdict,
    crmEvidenceVerdict: crmEvidence.verdict,
    opsAlertsVerdict: opsAlerts.verdict,
    securityVerdict: securityBaseline.verdict,
    notes: [
      'readyToCloseA6Core=true means DB-backed technical evidence is complete for core A6 closure criteria.',
      'Manual provider/browser evidence may still be required by governance docs before formal PASS sign-off.',
    ],
  };

  writeJson(summaryPath, summary);
  writeMarkdown(summaryMdPath, [
    '# A6 Closeout Summary',
    '',
    `Generated: ${summary.generatedAt}`,
    `Output Dir: ${outputDir}`,
    '',
    '## Automated Verdict',
    '',
    `- Reconciliation PASS: ${checks.reconcilePass ? 'YES' : 'NO'}`,
    `- P0 proof-pack PASS (03/04/05/06): ${checks.p0AllPass ? 'YES' : 'NO'}`,
    `- Inventory evidence PASS: ${checks.inventoryPass ? 'YES' : 'NO'}`,
    `- CRM evidence PASS: ${checks.crmPass ? 'YES' : 'NO'}`,
    `- Ops alerts PASS: ${checks.opsAlertsPass ? 'YES' : 'NO'}`,
    `- Security baseline PASS: ${checks.securityPass ? 'YES' : 'NO'}`,
    `- Ready to close A6 core: ${checks.readyToCloseA6Core ? 'YES' : 'NO'}`,
    '',
    '## P0 Detail',
    '',
    `- p0_03 (Dealertrack lifecycle): ${checks.p0Checks.p0_03 ? 'PASS_CANDIDATE' : 'IN_PROGRESS'}`,
    `- p0_04 (Finance audit trail): ${checks.p0Checks.p0_04 ? 'PASS_CANDIDATE' : 'IN_PROGRESS'}`,
    `- p0_05 (Stripe reconciliation): ${checks.p0Checks.p0_05 ? 'PASS_CANDIDATE' : 'IN_PROGRESS'}`,
    `- p0_06 (Webhook replay safety): ${checks.p0Checks.p0_06 ? 'PASS_CANDIDATE' : 'IN_PROGRESS'}`,
    '',
    '## Controls Detail',
    '',
    `- Inventory evidence verdict: ${inventoryEvidence.verdict}`,
    `- CRM evidence verdict: ${crmEvidence.verdict}`,
    `- Ops alerts verdict: ${opsAlerts.verdict}`,
    `- Security baseline verdict: ${securityBaseline.verdict}`,
    '',
    '## Artifacts',
    '',
    `- ${reconcilePath}`,
    `- ${p0ProofPath}`,
    `- ${inventoryEvidencePath}`,
    `- ${crmEvidencePath}`,
    `- ${opsAlertsPath}`,
    `- ${securityPath}`,
    `- ${summaryPath}`,
    `- ${summaryMdPath}`,
  ]);

  console.log(`\nA6 closeout artifacts written to: ${outputDir}`);
  console.log(`Summary: ${summaryPath}`);

  if (!checks.readyToCloseA6Core) {
    process.exit(2);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
