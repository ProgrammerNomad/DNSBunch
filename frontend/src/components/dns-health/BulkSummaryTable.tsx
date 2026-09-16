'use client';

import { DnsStatusIcon, type DnsStatus } from '@/components/dns-health/dns-status-icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { BulkDnsHealthRow } from '@/types/dns';

function cellStatus(value: string): DnsStatus | string {
  if (value === '-') return 'info';
  return value;
}

export function BulkSummaryTable({ rows }: { rows: BulkDnsHealthRow[] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Domain</TableHead>
            <TableHead className="text-center">Overall</TableHead>
            <TableHead className="text-center">NS</TableHead>
            <TableHead className="text-center">SOA</TableHead>
            <TableHead className="text-center">MX</TableHead>
            <TableHead className="text-center">WWW</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.domain}>
              <TableCell className="font-medium">{row.domain}</TableCell>
              <TableCell className="text-center">
                <DnsStatusIcon status={cellStatus(String(row.overall))} />
              </TableCell>
              <TableCell className="text-center">
                {row.ns === '-' ? '-' : <DnsStatusIcon status={cellStatus(String(row.ns))} />}
              </TableCell>
              <TableCell className="text-center">
                {row.soa === '-' ? '-' : <DnsStatusIcon status={cellStatus(String(row.soa))} />}
              </TableCell>
              <TableCell className="text-center">
                {row.mx === '-' ? '-' : <DnsStatusIcon status={cellStatus(String(row.mx))} />}
              </TableCell>
              <TableCell className="text-center">
                {row.www === '-' ? '-' : <DnsStatusIcon status={cellStatus(String(row.www))} />}
              </TableCell>
              <TableCell className="max-w-xs text-sm text-muted-foreground">{row.error || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
