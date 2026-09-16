import { isValidHostname } from '@/lib/validate-tool-domain';

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
  if (a === 169 && b === 254) return true;
  return false;
}

function normalizeHostInput(raw: string): string {
  let value = raw.trim();
  if (!value) {
    throw new Error('Host is required');
  }
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.port && parsed.port !== '443') {
        throw new Error('Only port 443 supported in v1');
      }
      value = parsed.hostname;
    } catch (err) {
      if (err instanceof Error && err.message.includes('443')) {
        throw err;
      }
      throw new Error('Invalid URL format');
    }
  }
  const lower = value.toLowerCase().replace(/\.$/, '');
  if (IPV4_PATTERN.test(lower) && isPrivateOrReservedIpv4(lower)) {
    throw new Error('Private or reserved IP addresses are not allowed');
  }
  if (lower === 'localhost' || lower.endsWith('.localhost')) {
    throw new Error('Target host is not allowed');
  }
  if (!isValidHostname(lower)) {
    throw new Error('Invalid host format');
  }
  return lower;
}

export type SslInspectorRequest = {
  host: string;
};

export function validateSslInspectorBody(
  body: unknown,
): { ok: true; data: SslInspectorRequest } | { ok: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body', code: 'INVALID_BODY' };
  }
  const record = body as Record<string, unknown>;
  const hostRaw = typeof record.host === 'string' ? record.host : '';
  if (!hostRaw.trim()) {
    return { ok: false, error: 'Host is required', code: 'INVALID_HOST' };
  }
  try {
    const host = normalizeHostInput(hostRaw);
    return { ok: true, data: { host } };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Invalid host',
      code: 'INVALID_HOST',
    };
  }
}
