import { NextRequest, NextResponse } from 'next/server';

// Backend server configuration from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the Python backend for CSRF token
    const backendResponse = await fetch(`${BACKEND_URL}/api/csrf-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('User-Agent') || 'DNSBunch-NextJS-Proxy',
        'X-Forwarded-For': request.headers.get('X-Forwarded-For') || 'unknown',
      },
    });

    // Get response data
    const data = await backendResponse.json();

    // Return the response with the same status code from backend
    return NextResponse.json(data, {
      status: backendResponse.status,
    });

  } catch (error) {
    console.error('CSRF Token API Proxy Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to backend CSRF service',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'CSRF_TOKEN_FAILED'
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
