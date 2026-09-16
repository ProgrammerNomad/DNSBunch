import { isValidDomain } from '@/lib/validate-tool-domain';

const IPV4_PATTERN =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 10 || a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 0 || a >= 224) return true;
  return false;
}

export type DnsblLookupRequest = {
  domain?: string;
  ip?: string;
};

export function validateDnsblLookupBody(
  body: unknown,
): { ok: true; data: DnsblLookupRequest } | { ok: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body', code: 'INVALID_BODY' };
  }
  const record = body as Record<string, unknown>;
  const domainRaw = typeof record.domain === 'string' ? record.domain.trim() : '';
  const ipRaw = typeof record.ip === 'string' ? record.ip.trim() : '';

  if (domainRaw && ipRaw) {
    return { ok: false, error: 'Provide domain or IP, not both', code: 'INVALID_TARGET' };
  }
  if (!domainRaw && !ipRaw) {
    return { ok: false, error: 'Domain or IP is required', code: 'INVALID_TARGET' };
  }

  if (domainRaw) {
    const domain = domainRaw.toLowerCase();
    if (!isValidDomain(domain)) {
      return { ok: false, error: 'Invalid domain format', code: 'INVALID_DOMAIN' };
    }
    return { ok: true, data: { domain } };
  }

  if (!IPV4_PATTERN.test(ipRaw)) {
    return { ok: false, error: 'Invalid IPv4 address', code: 'INVALID_IP' };
  }
  if (isPrivateOrReservedIpv4(ipRaw)) {
    return { ok: false, error: 'Private or reserved IP addresses are not allowed', code: 'INVALID_IP' };
  }
  return { ok: true, data: { ip: ipRaw } };
}
