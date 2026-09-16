const ALLOWED_RECORD_TYPES = new Set(['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME']);

const QUERY_NAME_PATTERN =
  /^[a-z0-9]([a-z0-9-]{0,61})?(\.[a-z0-9]([a-z0-9-]{0,61})?)*$/;

export type DnsPropagationRequest = {
  name: string;
  type: string;
};

export function validateDnsPropagationBody(
  body: unknown,
): { ok: true; data: DnsPropagationRequest } | { ok: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body', code: 'INVALID_BODY' };
  }
  const record = body as Record<string, unknown>;
  const nameRaw =
    typeof record.name === 'string'
      ? record.name
      : typeof record.domain === 'string'
        ? record.domain
        : '';
  const typeRaw = typeof record.type === 'string' ? record.type : '';

  const name = nameRaw.trim().toLowerCase().replace(/\.$/, '');
  if (!name) {
    return { ok: false, error: 'Name is required', code: 'INVALID_NAME' };
  }
  if (name.length > 253 || !QUERY_NAME_PATTERN.test(name)) {
    return { ok: false, error: 'Invalid DNS name format', code: 'INVALID_NAME' };
  }

  const type = typeRaw.trim().toUpperCase();
  if (!type) {
    return { ok: false, error: 'Record type is required', code: 'INVALID_TYPE' };
  }
  if (!ALLOWED_RECORD_TYPES.has(type)) {
    return {
      ok: false,
      error: 'Record type must be one of: A, AAAA, MX, NS, TXT, CNAME',
      code: 'INVALID_TYPE',
    };
  }

  return { ok: true, data: { name, type } };
}
