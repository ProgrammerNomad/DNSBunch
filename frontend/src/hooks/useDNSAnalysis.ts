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
      console.log(`Analyzing domain: ${domain} with checks:`, checks.length === 0 ? 'ALL CHECKS' : checks);
      const analysisResult = await dnsApi.analyzeDomain(domain, checks);
      console.log('Analysis completed:', analysisResult);
      setResults(analysisResult);
    } catch (err) {
      console.error('DNS analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze domain';
      setError(errorMessage);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    searchDomain,
    clearResults
  };
}
