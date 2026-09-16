const DEFAULT_MAX = parseInt(process.env.BULK_MAX_DOMAINS || '50', 10);

export type DnsHealthBulkRequest = {
  surface: 'bulk';
  domains: string[];
};

export function validateDnsHealthBulkBody(
  body: unknown,
  maxDomains = DEFAULT_MAX,
): { ok: true; data: DnsHealthBulkRequest } | { ok: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body', code: 'INVALID_BODY' };
  }
  const record = body as Record<string, unknown>;
  if (record.surface !== 'bulk') {
    return { ok: false, error: 'Expected surface "bulk"', code: 'INVALID_SURFACE' };
  }
  if (!Array.isArray(record.domains)) {
    return { ok: false, error: 'domains must be an array', code: 'INVALID_DOMAINS' };
  }

  const seen = new Set<string>();
  const domains: string[] = [];
  for (const item of record.domains) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    domains.push(trimmed);
  }

  if (domains.length === 0) {
    return { ok: false, error: 'At least one domain is required', code: 'EMPTY_DOMAINS' };
  }
  if (domains.length > maxDomains) {
    return {
      ok: false,
      error: `Maximum ${maxDomains} domains per bulk request`,
      code: 'DOMAIN_LIMIT',
    };
  }

  return { ok: true, data: { surface: 'bulk', domains } };
}
