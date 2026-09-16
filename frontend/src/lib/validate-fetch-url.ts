const MAX_FETCH_URL_LENGTH = 2048;

const IPV4_PATTERN =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata',
  '0.0.0.0',
]);

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

function normalizeFetchUrlInput(raw: string): string {
  let url = raw.trim();
  if (!url) {
    throw new Error('URL is required');
  }
  if (url.length > MAX_FETCH_URL_LENGTH) {
    throw new Error('URL is too long');
  }
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

function assertSafeHostname(hostname: string): void {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (!host) {
    throw new Error('URL host is required');
  }
  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith('.localhost')) {
    throw new Error('Target host is not allowed');
  }
  if (IPV4_PATTERN.test(host) && isPrivateOrReservedIpv4(host)) {
    throw new Error('Private or reserved IP addresses are not allowed');
  }
}

export type FetchUrlRequest = {
  url: string;
};

export function validateFetchUrlBody(
  body: unknown,
): { ok: true; data: FetchUrlRequest } | { ok: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body', code: 'INVALID_BODY' };
  }
  const record = body as Record<string, unknown>;
  const urlRaw = typeof record.url === 'string' ? record.url : '';
  if (!urlRaw.trim()) {
    return { ok: false, error: 'URL is required', code: 'INVALID_URL' };
  }

  let normalized: string;
  try {
    normalized = normalizeFetchUrlInput(urlRaw);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Invalid URL',
      code: 'INVALID_URL',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { ok: false, error: 'Invalid URL format', code: 'INVALID_URL' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'URL scheme must be http or https', code: 'INVALID_URL' };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: 'URL must not include userinfo', code: 'INVALID_URL' };
  }

  try {
    assertSafeHostname(parsed.hostname);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Target host is not allowed',
      code: 'INVALID_URL',
    };
  }

  return { ok: true, data: { url: normalized } };
}
