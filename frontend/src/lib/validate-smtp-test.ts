import { isValidDomain, isValidHostname } from '@/lib/validate-tool-domain';

export type SmtpTestRequest = {
  domain?: string;
  host?: string;
  port: number;
};

const ALLOWED_PORTS = new Set([25, 587]);

export function validateSmtpTestBody(
  body: unknown,
): { ok: true; data: SmtpTestRequest } | { ok: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body', code: 'INVALID_BODY' };
  }
  const record = body as Record<string, unknown>;

  const domainRaw = typeof record.domain === 'string' ? record.domain.trim() : '';
  const hostRaw = typeof record.host === 'string' ? record.host.trim() : '';

  if (domainRaw && hostRaw) {
    return { ok: false, error: 'Provide domain or host, not both', code: 'INVALID_TARGET' };
  }
  if (!domainRaw && !hostRaw) {
    return { ok: false, error: 'Domain or host is required', code: 'INVALID_TARGET' };
  }

  let port = 25;
  if (record.port !== undefined && record.port !== null) {
    if (typeof record.port !== 'number' || !Number.isInteger(record.port)) {
      return { ok: false, error: 'Port must be an integer', code: 'INVALID_PORT' };
    }
    port = record.port;
  }
  if (!ALLOWED_PORTS.has(port)) {
    return { ok: false, error: 'Port must be 25 or 587', code: 'INVALID_PORT' };
  }

  if (domainRaw) {
    const domain = domainRaw.toLowerCase();
    if (!isValidDomain(domain)) {
      return { ok: false, error: 'Invalid domain format', code: 'INVALID_DOMAIN' };
    }
    return { ok: true, data: { domain, port } };
  }

  const host = hostRaw.toLowerCase().replace(/\.$/, '');
  if (!isValidHostname(host)) {
    return { ok: false, error: 'Invalid host format', code: 'INVALID_HOST' };
  }
  return { ok: true, data: { host, port } };
}
