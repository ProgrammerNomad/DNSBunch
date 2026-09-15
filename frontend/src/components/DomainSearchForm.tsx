'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, X } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DomainSearchFormProps } from '../types/dns';

const DNS_RECORD_TYPES = [
  { id: 'domain_status', label: 'Domain Status', description: 'Check if domain is active, suspended, expired, or parked' },
  { id: 'ns', label: 'NS (Nameservers)', description: 'Nameserver records' },
  { id: 'soa', label: 'SOA (Start of Authority)', description: 'Domain authority information' },
  { id: 'a', label: 'A (IPv4)', description: 'IPv4 address records' },
  { id: 'aaaa', label: 'AAAA (IPv6)', description: 'IPv6 address records' },
  { id: 'mx', label: 'MX (Mail Exchange)', description: 'Mail server records' },
  { id: 'spf', label: 'SPF', description: 'Sender Policy Framework' },
  { id: 'txt', label: 'TXT', description: 'Text records' },
  { id: 'cname', label: 'CNAME', description: 'Canonical name records' },
  { id: 'ptr', label: 'PTR (Reverse DNS)', description: 'Reverse DNS lookups' },
  { id: 'caa', label: 'CAA', description: 'Certificate Authority Authorization' },
  { id: 'dmarc', label: 'DMARC', description: 'Email authentication policy' },
  { id: 'dkim', label: 'DKIM', description: 'DomainKeys Identified Mail' },
  { id: 'glue', label: 'Glue Records', description: 'Nameserver glue records' },
  { id: 'dnssec', label: 'DNSSEC', description: 'DNS Security Extensions' },
  { id: 'axfr', label: 'AXFR (Zone Transfer)', description: 'Zone transfer check' },
  { id: 'wildcard', label: 'Wildcard', description: 'Wildcard DNS records' },
  { id: 'www', label: 'WWW (CNAME/A Records)', description: 'WWW subdomain analysis' },
];

export function DomainSearchForm({
  onSearch,
  loading = false,
  error = null,
  initialDomain = '',
}: DomainSearchFormProps) {
  const [domain, setDomain] = useState(initialDomain);
  const [resultType, setResultType] = useState<'normal' | 'advanced'>('normal');
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const previousInitialDomainRef = useRef<string>('');

  useEffect(() => {
    if (initialDomain !== previousInitialDomainRef.current) {
      setDomain(initialDomain);
      previousInitialDomainRef.current = initialDomain;
      setDomainError(null);
    }
  }, [initialDomain]);

  const validateDomain = (value: string): boolean => {
    if (!value.trim()) {
      setDomainError('Domain name is required');
      return false;
    }
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
    if (!domainRegex.test(value)) {
      setDomainError('Please enter a valid domain name');
      return false;
    }
    const suspicious = ['localhost', '127.0.0.1', 'test.test', 'example.example'];
    if (suspicious.some((pattern) => value.toLowerCase().includes(pattern))) {
      setDomainError('Please enter a real domain name');
      return false;
    }
    setDomainError(null);
    return true;
  };

  const handleDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDomain(value);
    if (value.trim()) validateDomain(value);
    else setDomainError(null);
  };

  const handleClearDomain = () => {
    setDomain('');
    setDomainError(null);
  };

  const handleCheckChange = (checkId: string, checked: boolean) => {
    setSelectedChecks((prev) => {
      const newChecks = checked ? [...prev, checkId] : prev.filter((id) => id !== checkId);
      setSelectAll(newChecks.length === DNS_RECORD_TYPES.length);
      return newChecks;
    });
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedChecks(DNS_RECORD_TYPES.map((type) => type.id));
      setSelectAll(true);
    } else {
      setSelectedChecks([]);
      setSelectAll(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateDomain(domain)) return;
    const checksToRun = resultType === 'normal' ? [] : selectedChecks;
    onSearch(domain.trim().toLowerCase(), checksToRun, resultType);
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={handleDomainChange}
                disabled={loading}
                className={cn('pl-9 pr-9', domainError && 'border-destructive')}
                aria-invalid={!!domainError}
              />
              {domain && (
                <button
                  type="button"
                  onClick={handleClearDomain}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                  aria-label="Clear domain"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={loading || !!domainError || !domain.trim()} className="sm:min-w-[140px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </Button>
          </div>
          <Label htmlFor="domain" className="sr-only">
            Domain Name
          </Label>

          {domainError && (
            <Alert variant="destructive">
              <AlertDescription>{domainError}</AlertDescription>
            </Alert>
          )}

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Result format</legend>
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="radio"
                  name="resultType"
                  value="normal"
                  checked={resultType === 'normal'}
                  onChange={() => setResultType('normal')}
                  disabled={loading}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium">Normal</span>
                  <span className="text-xs text-muted-foreground">Table format</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="radio"
                  name="resultType"
                  value="advanced"
                  checked={resultType === 'advanced'}
                  onChange={() => setResultType('advanced')}
                  disabled={loading}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium">Advanced</span>
                  <span className="text-xs text-muted-foreground">Detailed analysis</span>
                </span>
              </label>
            </div>
          </fieldset>

          {resultType === 'advanced' && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="mb-3 text-sm font-semibold">DNS checks (optional - empty runs all)</p>
              <label className="mb-3 flex items-center gap-2">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={(v) => handleSelectAllChange(v === true)}
                  disabled={loading}
                />
                <span className="text-sm font-semibold">Select all</span>
              </label>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {DNS_RECORD_TYPES.map((type) => (
                  <label key={type.id} className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={selectedChecks.includes(type.id)}
                      onCheckedChange={(v) => handleCheckChange(type.id, v === true)}
                      disabled={loading}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium">{type.label}</span>
                      <span className="block text-xs text-muted-foreground">{type.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {resultType === 'normal' && (
            <Alert>
              <AlertDescription>
                <strong>Normal mode:</strong> Simple table with pass/warning/error status - good for quick health checks.
              </AlertDescription>
            </Alert>
          )}
          {resultType === 'advanced' && (
            <Alert>
              <AlertDescription>
                <strong>Advanced mode:</strong> Categorized results with technical detail and recommendations.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
