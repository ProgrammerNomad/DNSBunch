const MAX_DOMAIN_LENGTH = 253;

const DOMAIN_PATTERN =
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const SUSPICIOUS = ['localhost', '127.0.0.1', 'test.test', 'example.example'];

export type ToolDomainRequest = {
  domain: string;
};

/** Tools that accept POST `{ domain }` - keep in sync with BFF validation. */
export const DOMAIN_TOOL_IDS = [
  'dmarc_checker',
  'spf_checker',
  'mx_lookup',
  'whois_lookup',
  'domain_expiry',
] as const;

export type DomainToolId = (typeof DOMAIN_TOOL_IDS)[number];

export function isDomainToolId(toolId: string): toolId is DomainToolId {
  return (DOMAIN_TOOL_IDS as readonly string[]).includes(toolId);
}

const DKIM_SELECTOR_PATTERN = /^[a-z0-9]([a-z0-9-]{0,62})?$/;

export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > MAX_DOMAIN_LENGTH) return false;
  if (!DOMAIN_PATTERN.test(domain)) return false;
  const lower = domain.toLowerCase();
  if (SUSPICIOUS.some((p) => lower.includes(p))) return false;
  return true;
}

const HOSTNAME_PATTERN =
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,62})?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,62})?)*$/;

export function isValidHostname(host: string): boolean {
  if (!host || host.length > 253) return false;
  const lower = host.toLowerCase();
  if (lower === 'localhost' || lower === 'localhost.localdomain') return false;
  return HOSTNAME_PATTERN.test(host);
}

export function isValidDkimSelector(selector: string): boolean {
  if (!selector || selector.length > 63) return false;
  return DKIM_SELECTOR_PATTERN.test(selector);
}

export function validateToolDomainBody(
  body: unknown,
): { ok: true; data: ToolDomainRequest } | { ok: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body', code: 'INVALID_BODY' };
  }
  const record = body as Record<string, unknown>;
  if (typeof record.domain !== 'string') {
    return { ok: false, error: 'domain is required', code: 'INVALID_DOMAIN' };
  }
  const trimmed = record.domain.trim();
  if (!trimmed) {
    return { ok: false, error: 'Domain is required', code: 'INVALID_DOMAIN' };
  }
  const normalized = trimmed.toLowerCase();
  if (!isValidDomain(normalized)) {
    return { ok: false, error: 'Invalid domain format', code: 'INVALID_DOMAIN' };
  }
  return { ok: true, data: { domain: normalized } };
}
