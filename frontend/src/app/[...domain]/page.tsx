'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DomainPageProps {
  params: Promise<{
    domain: string[];
  }>;
}

export default function DomainPage({ params }: DomainPageProps) {
  const router = useRouter();

  useEffect(() => {
    const handleParams = async () => {
      try {
        const resolvedParams = await params;
        
        // Join the domain parts and redirect to main page with query parameter
        const domainPath = resolvedParams.domain.join('/');
        
        // Extract domain from URL-like paths
        const extractDomainFromPath = (path: string): string | null => {
          try {
            // Remove protocol if present
            let cleanPath = path.replace(/^https?:\/\//, '');
            
            // If it looks like a URL with path, extract just the domain part
            if (cleanPath.includes('/')) {
              cleanPath = cleanPath.split('/')[0];
            }
            
            // Basic domain validation
            if (/^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/.test(cleanPath) && cleanPath.includes('.')) {
              return cleanPath;
            }
            
            return null;
          } catch {
            return null;
          }
        };

        const domain = extractDomainFromPath(domainPath);
        
        if (domain) {
          // Redirect to home page with query parameter (internal handling)
          router.replace(`/?domain=${encodeURIComponent(domain)}`);
        } else {
          // Invalid domain, redirect to home
          router.replace('/');
        }
      } catch (error) {
        console.error('Error handling params:', error);
        router.replace('/');
      }
    };
    
    handleParams();
  }, [params, router]);

  // Show loading while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px' 
    }}>
      Loading DNS analysis...
    </div>
  );
}
