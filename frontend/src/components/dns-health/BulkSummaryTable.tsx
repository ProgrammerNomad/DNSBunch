'use client';

import Link from 'next/link';

import { DnsStatusIcon, type DnsStatus } from '@/components/dns-health/dns-status-icon';
import { Button } from '@/components/ui/button';
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
  if (value === '-' || value === '-') return 'info';
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
            <TableHead className="text-right">Actions</TableHead>
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
                {row.ns === '-' || row.ns === '-' ? (
                  '-'
                ) : (
                  <DnsStatusIcon status={cellStatus(String(row.ns))} />
                )}
              </TableCell>
              <TableCell className="text-center">
                {row.soa === '-' || row.soa === '-' ? (
                  '-'
                ) : (
                  <DnsStatusIcon status={cellStatus(String(row.soa))} />
                )}
              </TableCell>
              <TableCell className="text-center">
                {row.mx === '-' || row.mx === '-' ? (
                  '-'
                ) : (
                  <DnsStatusIcon status={cellStatus(String(row.mx))} />
                )}
              </TableCell>
              <TableCell className="text-center">
                {row.www === '-' || row.www === '-' ? (
                  '-'
                ) : (
                  <DnsStatusIcon status={cellStatus(String(row.www))} />
                )}
              </TableCell>
              <TableCell className="max-w-xs text-sm text-muted-foreground">{row.error || '-'}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/?domain=${encodeURIComponent(row.domain)}`}>View full</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
