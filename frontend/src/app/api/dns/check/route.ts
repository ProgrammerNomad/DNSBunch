import { NextRequest, NextResponse } from 'next/server';

// Backend server configuration from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Helper function to get CSRF token from backend
async function getCsrfToken(userAgent: string, forwardedFor: string): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/csrf-token`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
      'X-Forwarded-For': forwardedFor,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get CSRF token: ${response.status}`);
  }

  const data = await response.json();
  return data.csrf_token;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request
    const body = await request.json();
    
    // Extract headers for CSRF token request
    const userAgent = request.headers.get('User-Agent') || 'DNSBunch-NextJS-Proxy';
    const forwardedFor = request.headers.get('X-Forwarded-For') || 
                        request.headers.get('X-Real-IP') || 
                        'unknown';

    // Get CSRF token first
    const csrfToken = await getCsrfToken(userAgent, forwardedFor);
    
    // Forward the request to the Python backend with CSRF token
    const backendResponse = await fetch(`${BACKEND_URL}/api/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
        'X-Forwarded-For': forwardedFor,
        'X-CSRF-Token': csrfToken, // Include CSRF token
      },
      body: JSON.stringify(body),
    });

    // Get response data
    const data = await backendResponse.json();

    // Return the response with the same status code from backend
    return NextResponse.json(data, {
      status: backendResponse.status,
    });

  } catch (error) {
    console.error('DNS Check API Proxy Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to DNS analysis service',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROXY_ERROR'
      },
      { 
        status: 500
      }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
  });
}
