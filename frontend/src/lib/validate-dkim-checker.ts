import { isValidDkimSelector, isValidDomain } from '@/lib/validate-tool-domain';

export type DkimCheckerRequest = {
  domain: string;
  selector: string;
};

export function validateDkimCheckerBody(
  body: unknown,
): { ok: true; data: DkimCheckerRequest } | { ok: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body', code: 'INVALID_BODY' };
  }
  const record = body as Record<string, unknown>;
  if (typeof record.domain !== 'string') {
    return { ok: false, error: 'domain is required', code: 'INVALID_DOMAIN' };
  }
  if (typeof record.selector !== 'string') {
    return { ok: false, error: 'selector is required', code: 'INVALID_SELECTOR' };
  }

  const domainTrimmed = record.domain.trim();
  const selectorTrimmed = record.selector.trim();
  if (!domainTrimmed) {
    return { ok: false, error: 'Domain is required', code: 'INVALID_DOMAIN' };
  }
  if (!selectorTrimmed) {
    return { ok: false, error: 'Selector is required', code: 'INVALID_SELECTOR' };
  }

  const domain = domainTrimmed.toLowerCase();
  const selector = selectorTrimmed.toLowerCase();
  if (!isValidDomain(domain)) {
    return { ok: false, error: 'Invalid domain format', code: 'INVALID_DOMAIN' };
  }
  if (!isValidDkimSelector(selector)) {
    return { ok: false, error: 'Invalid selector format', code: 'INVALID_SELECTOR' };
  }

  return { ok: true, data: { domain, selector } };
}
