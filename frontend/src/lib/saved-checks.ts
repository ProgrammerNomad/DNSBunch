import { prisma } from '@/lib/prisma';

export type SavedCheckSummary = {
  label: string;
  domain?: string;
  url?: string;
  selector?: string;
  status?: string;
  surface?: string;
};

function getMaxSavedChecksPerUser(): number {
  const raw = parseInt(process.env.SAVED_CHECKS_MAX_PER_USER || '100', 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 100;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function pickString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) {
      return v.trim();
    }
  }
  return undefined;
}

export function buildToolRunSummary(
  toolId: string,
  proxyBody: unknown,
  upstreamJson: unknown,
  surface?: string,
): SavedCheckSummary {
  const body = asRecord(proxyBody);
  const data = asRecord(upstreamJson);

  const domain = pickString(body.domain, data.domain, body.name);
  const url = pickString(body.url, data.url, data.final_url);
  const selector = pickString(body.selector, data.selector);
  const status = pickString(data.status, data.overall_status);

  let label = domain || url || toolId;
  if (toolId === 'dns_propagation' && domain) {
    const type = pickString(body.type, data.type);
    label = type ? `${domain} (${type})` : domain;
  }
  if (toolId === 'dkim_checker' && domain && selector) {
    label = `${selector}._domainkey.${domain}`;
  }

  return {
    label,
    ...(domain ? { domain } : {}),
    ...(url ? { url } : {}),
    ...(selector ? { selector } : {}),
    ...(status ? { status } : {}),
    ...(surface ? { surface } : {}),
  };
}

export async function persistSavedCheck(userId: string, toolId: string, summary: SavedCheckSummary): Promise<void> {
  const max = getMaxSavedChecksPerUser();

  await prisma.$transaction(async (tx) => {
    const count = await tx.savedCheck.count({ where: { userId } });
    if (count >= max) {
      const excess = count - max + 1;
      const oldest = await tx.savedCheck.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: excess,
        select: { id: true },
      });
      if (oldest.length > 0) {
        await tx.savedCheck.deleteMany({ where: { id: { in: oldest.map((row) => row.id) } } });
      }
    }

    await tx.savedCheck.create({
      data: {
        userId,
        toolId,
        summaryJson: JSON.stringify(summary),
      },
    });
  });
}

const TOOL_HREF: Record<string, string> = {
  dns_health: '/',
  dmarc_checker: '/tools/dmarc-checker',
  spf_checker: '/tools/spf-checker',
  dkim_checker: '/tools/dkim-checker',
  mx_lookup: '/tools/mx-lookup',
  smtp_test: '/tools/smtp-test',
  dnsbl_lookup: '/tools/dnsbl-lookup',
  http_headers: '/tools/http-headers',
  redirect_chain: '/tools/redirect-chain',
  http_status: '/tools/http-status',
  ssl_inspector: '/tools/ssl-inspector',
  whois_lookup: '/tools/whois-lookup',
  domain_expiry: '/tools/domain-expiry',
  dns_propagation: '/tools/dns-propagation',
};

export function savedCheckHref(toolId: string, summary: SavedCheckSummary): string | null {
  const base = TOOL_HREF[toolId];
  if (!base) {
    return null;
  }

  const params = new URLSearchParams();
  if (summary.domain) {
    params.set('domain', summary.domain);
  }
  if (summary.url) {
    params.set('url', summary.url);
  }
  if (summary.selector) {
    params.set('selector', summary.selector);
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function parseSavedCheckSummary(json: string): SavedCheckSummary {
  try {
    const parsed = JSON.parse(json) as SavedCheckSummary;
    if (parsed && typeof parsed.label === 'string') {
      return parsed;
    }
  } catch {
    /* fall through */
  }
  return { label: 'Check' };
}
