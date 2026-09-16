const MAX_DOMAIN_LENGTH = 253;

const DOMAIN_PATTERN =
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const SUSPICIOUS = ['localhost', '127.0.0.1', 'test.test', 'example.example'];

export type ToolDomainRequest = {
  domain: string;
};

function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > MAX_DOMAIN_LENGTH) return false;
  if (!DOMAIN_PATTERN.test(domain)) return false;
  const lower = domain.toLowerCase();
  if (SUSPICIOUS.some((p) => lower.includes(p))) return false;
  return true;
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
