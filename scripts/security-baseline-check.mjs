import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function nowIso() {
  return new Date().toISOString();
}

function hasMeaningfulValue(value) {
  return Boolean(value && value.trim() && value !== '...' && !value.includes('...'));
}

function buildChecks() {
  const checks = [];

  const requiredSecrets = [
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

  for (const name of requiredSecrets) {
    const value = process.env[name] ?? '';
    checks.push({
      check: `env.${name}`,
      status: hasMeaningfulValue(value) ? 'PASS' : 'FAIL',
      message: hasMeaningfulValue(value)
        ? `${name} is configured`
        : `${name} is missing`,
    });
  }

  checks.push({
    check: 'env.NEXT_PUBLIC_SITE_URL',
    status: hasMeaningfulValue(process.env.NEXT_PUBLIC_SITE_URL ?? '') ? 'PASS' : 'WARN',
    message: hasMeaningfulValue(process.env.NEXT_PUBLIC_SITE_URL ?? '')
      ? 'NEXT_PUBLIC_SITE_URL configured'
      : 'NEXT_PUBLIC_SITE_URL missing',
  });

  const allowAllHosts = process.env.NEXT_PUBLIC_ALLOW_ALL_IMAGE_HOSTS;
  checks.push({
    check: 'env.NEXT_PUBLIC_ALLOW_ALL_IMAGE_HOSTS',
    status: allowAllHosts === '1' ? 'WARN' : 'PASS',
    message:
      allowAllHosts === '1'
        ? 'Wildcard image hosts enabled; this should stay off in production'
        : 'Wildcard image hosts disabled',
  });

  const routeoneEnabled = process.env.ENABLE_ROUTEONE === '1';
  checks.push({
    check: 'feature.ENABLE_ROUTEONE',
    status: routeoneEnabled && !hasMeaningfulValue(process.env.ROUTEONE_API_KEY ?? '') ? 'FAIL' : 'PASS',
    message:
      routeoneEnabled && !hasMeaningfulValue(process.env.ROUTEONE_API_KEY ?? '')
        ? 'RouteOne enabled but ROUTEONE_API_KEY is missing'
        : 'RouteOne integration flag/key combination valid',
  });

  const dealertrackEnabled = process.env.ENABLE_DEALERTRACK === '1';
  checks.push({
    check: 'feature.ENABLE_DEALERTRACK',
    status:
      dealertrackEnabled && !hasMeaningfulValue(process.env.DEALERTRACK_API_KEY ?? '')
        ? 'FAIL'
        : 'PASS',
    message:
      dealertrackEnabled && !hasMeaningfulValue(process.env.DEALERTRACK_API_KEY ?? '')
        ? 'Dealertrack enabled but DEALERTRACK_API_KEY is missing'
        : 'Dealertrack integration flag/key combination valid',
  });

  const autoraptorEnabled = process.env.ENABLE_AUTORAPTOR === '1';
  checks.push({
    check: 'feature.ENABLE_AUTORAPTOR',
    status:
      autoraptorEnabled && !hasMeaningfulValue(process.env.AUTORAPTOR_API_KEY ?? '')
        ? 'FAIL'
        : 'PASS',
    message:
      autoraptorEnabled && !hasMeaningfulValue(process.env.AUTORAPTOR_API_KEY ?? '')
        ? 'AutoRaptor enabled but AUTORAPTOR_API_KEY is missing'
        : 'AutoRaptor integration flag/key combination valid',
  });

  return checks;
}

function summarize(checks) {
  const failed = checks.filter((c) => c.status === 'FAIL').length;
  const warns = checks.filter((c) => c.status === 'WARN').length;

  return {
    generatedAt: nowIso(),
    totals: {
      checks: checks.length,
      pass: checks.filter((c) => c.status === 'PASS').length,
      warn: warns,
      fail: failed,
    },
    checks,
    verdict: failed === 0 ? 'PASS' : 'FAIL',
  };
}

function main() {
  const requireSecrets = process.argv.includes('--require-secrets');
  const outputArg = process.argv[2];

  const checks = buildChecks();
  const report = summarize(checks);
  console.log(JSON.stringify(report, null, 2));

  if (outputArg) {
    const outPath = path.resolve(outputArg);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(`Security report written: ${outPath}`);
  }

  if (requireSecrets && report.verdict !== 'PASS') {
    process.exit(2);
  }
}

main();
