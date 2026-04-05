function toInt(value) {
  const parsed = Number.parseInt(String(value ?? 0), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeMismatchCounters(mismatches) {
  const normalized = {};
  for (const [key, value] of Object.entries(mismatches)) {
    normalized[key] = toInt(value);
  }
  return normalized;
}

export function summarizeMismatchCounters(mismatches) {
  const normalized = normalizeMismatchCounters(mismatches);
  const criticalMismatchCount = Object.values(normalized).reduce(
    (acc, value) => acc + value,
    0,
  );

  return {
    mismatches: normalized,
    criticalMismatchCount,
    verdict: criticalMismatchCount === 0 ? 'PASS' : 'FAIL',
  };
}

