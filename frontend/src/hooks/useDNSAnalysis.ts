'use client';

import { useState } from 'react';
import { dnsApi, DNSAnalysisResult } from '../services/api';

export function useDNSAnalysis() {
  const [results, setResults] = useState<DNSAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDomain = async (domain: string, checks: string[] = []) => {
    setLoading(true);
    setError(null);

    try {
      const response = await dnsApi.checkDomain(domain, checks);
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return { results, loading, error, searchDomain, clearResults };
}
