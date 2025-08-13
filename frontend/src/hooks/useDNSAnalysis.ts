'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { dnsApi, DNSAnalysisResult } from '../services/api';

export function useDNSAnalysis() {
  const [results, setResults] = useState<DNSAnalysisResult | null>(null);

  const mutation = useMutation({
    mutationFn: (domain: string) => dnsApi.analyzeDomain(domain),
    onSuccess: (data) => {
      setResults(data);
    },
    onError: (error) => {
      console.error('DNS analysis failed:', error);
      setResults(null);
    },
  });

  const searchDomain = (domain: string) => {
    if (!domain.trim()) {
      return;
    }
    mutation.mutate(domain.trim());
  };

  const clearResults = () => {
    setResults(null);
    mutation.reset();
  };

  return {
    results,
    loading: mutation.isPending,
    error: mutation.error?.message || null,
    searchDomain,
    clearResults,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}
