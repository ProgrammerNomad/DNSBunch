'use client';

interface CSRFTokenData {
  csrf_token: string;
  expires_in: number;
  expires_at: number;
  server_time: number;
}

class CSRFService {
  private token: string | null = null;
  private expiresAt: number = 0;
  private refreshPromise: Promise<void> | null = null;
  private readonly REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes in ms
  private readonly STORAGE_KEY = 'dnsbunch_csrf_token';
  private readonly STORAGE_EXPIRES_KEY = 'dnsbunch_csrf_expires';

  constructor() {
    // Try to load existing token from sessionStorage (more secure than localStorage)
    this.loadTokenFromStorage();
  }

  /**
   * Get a valid CSRF token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.token && this.isTokenValid()) {
      return this.token;
    }

    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      await this.refreshPromise;
      return this.token!;
    }

    // Start a new refresh
    await this.refreshToken();
    return this.token!;
  }

  /**
   * Check if current token is valid and not expired
   */
  private isTokenValid(): boolean {
    if (!this.token || !this.expiresAt) {
      return false;
    }

    const now = Date.now();
    const serverTimeOffset = this.getServerTimeOffset();
    const adjustedNow = now + serverTimeOffset;

    // Check if token is expired (with 5 minute buffer)
    return adjustedNow < (this.expiresAt - 5 * 60 * 1000);
  }

  /**
   * Refresh the CSRF token from the server
   */
  private async refreshToken(): Promise<void> {
    this.refreshPromise = this._performRefresh();
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Actually perform the token refresh
   */
  private async _performRefresh(): Promise<void> {
    try {
      console.log('Refreshing CSRF token...');
      
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin', // Important for CSRF protection
      });

      if (!response.ok) {
        throw new Error(`Failed to get CSRF token: ${response.status}`);
      }

      const data: CSRFTokenData = await response.json();
      
      // Validate response
      if (!data.csrf_token || !data.expires_at) {
        throw new Error('Invalid CSRF token response');
      }

      // Store new token
      this.token = data.csrf_token;
      this.expiresAt = data.expires_at * 1000; // Convert to milliseconds
      
      // Save to storage
      this.saveTokenToStorage();
      
      console.log('CSRF token refreshed successfully');
      
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
      this.clearToken();
      throw new Error('Unable to obtain security token. Please refresh the page.');
    }
  }

  /**
   * Clear the current token
   */
  private clearToken(): void {
    this.token = null;
    this.expiresAt = 0;
    this.clearTokenFromStorage();
  }

  /**
   * Save token to secure storage
   */
  private saveTokenToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // Only store a hash of the token, not the full token
        const tokenHash = this.hashToken(this.token!);
        sessionStorage.setItem(this.STORAGE_KEY, tokenHash);
        sessionStorage.setItem(this.STORAGE_EXPIRES_KEY, this.expiresAt.toString());
      }
    } catch (error) {
      console.warn('Failed to save CSRF token to storage:', error);
    }
  }

  /**
   * Load token from storage (with validation)
   */
  private loadTokenFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const tokenHash = sessionStorage.getItem(this.STORAGE_KEY);
        const expiresStr = sessionStorage.getItem(this.STORAGE_EXPIRES_KEY);
        
        if (tokenHash && expiresStr) {
          const expires = parseInt(expiresStr, 10);
          const now = Date.now();
          
          // Only load if not expired
          if (expires > now) {
            // We can't restore the actual token from hash, so we'll need to refresh
            this.expiresAt = expires;
            // Token will be refreshed on first use
          } else {
            this.clearTokenFromStorage();
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load CSRF token from storage:', error);
      this.clearTokenFromStorage();
    }
  }

  /**
   * Clear token from storage
   */
  private clearTokenFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.STORAGE_EXPIRES_KEY);
      }
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Create a hash of the token for storage validation
   */
  private hashToken(token: string): string {
    // Simple hash for validation (not cryptographic)
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get estimated server time offset
   */
  private getServerTimeOffset(): number {
    // This would be set during token refresh based on server_time
    // For now, assume clocks are synchronized
    return 0;
  }

  /**
   * Handle CSRF token refresh requirement from server
   */
  handleRefreshRequired(): void {
    console.log('Server requested CSRF token refresh');
    this.clearToken();
  }

  /**
   * Check if we should proactively refresh the token
   */
  shouldRefreshToken(): boolean {
    if (!this.token || !this.expiresAt) {
      return true;
    }

    const now = Date.now();
    const timeUntilExpiry = this.expiresAt - now;
    
    return timeUntilExpiry < this.REFRESH_THRESHOLD;
  }
}

// Export singleton instance
export const csrfService = new CSRFService();
export default csrfService;