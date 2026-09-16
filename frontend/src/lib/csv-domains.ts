import type { BulkDnsHealthRow } from '@/types/dns';

const DEFAULT_MAX = parseInt(process.env.NEXT_PUBLIC_BULK_MAX_DOMAINS || process.env.BULK_MAX_DOMAINS || '50', 10);

/** Dedupe domains case-insensitively, preserve first occurrence casing. */
export function dedupeDomains(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const trimmed = (item || '').trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

export function parseDomainsFromText(text: string): string[] {
  return dedupeDomains(text.split(/[\n,;\s]+/));
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

export type ParseCsvResult =
  | { ok: true; domains: string[] }
  | { ok: false; error: string };

export function parseDomainsFromCsv(csvText: string, maxDomains = DEFAULT_MAX): ParseCsvResult {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { ok: false, error: 'CSV file is empty' };
  }

  const firstFields = parseCsvLine(lines[0]);
  const headerLower = firstFields.map((h) => h.toLowerCase());
  const domainColIndex = headerLower.indexOf('domain');

  let startRow = 0;
  let colIndex = 0;
  if (domainColIndex >= 0) {
    startRow = 1;
    colIndex = domainColIndex;
  }

  const extracted: string[] = [];
  for (let i = startRow; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const cell = fields[colIndex] ?? fields[0] ?? '';
    const value = cell.replace(/^"|"$/g, '').trim();
    if (value) extracted.push(value);
  }

  const domains = dedupeDomains(extracted);
  if (domains.length === 0) {
    return { ok: false, error: 'No domains found in CSV (use a domain column or first column)' };
  }
  if (domains.length > maxDomains) {
    return { ok: false, error: `Maximum ${maxDomains} domains per bulk request` };
  }

  return { ok: true, domains };
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function bulkResultsToCsv(rows: BulkDnsHealthRow[]): string {
  const header = ['domain', 'overall', 'ns', 'soa', 'mx', 'www', 'error'];
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.domain,
        String(row.overall),
        String(row.ns),
        String(row.soa),
        String(row.mx),
        String(row.www),
        row.error ?? '',
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  return lines.join('\n');
}

export function downloadBulkResultsCsv(rows: BulkDnsHealthRow[]): void {
  const csv = bulkResultsToCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `dnsbunch-bulk-${date}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export { DEFAULT_MAX as BULK_MAX_DOMAINS };
