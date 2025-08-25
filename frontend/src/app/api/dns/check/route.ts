import { NextRequest, NextResponse } from 'next/server';

// Backend server configuration from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request
    const body = await request.json();
    
    // Forward the request to the Python backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward relevant headers
        'User-Agent': request.headers.get('User-Agent') || 'DNSBunch-NextJS-Proxy',
        'X-Forwarded-For': request.headers.get('X-Forwarded-For') || 'unknown',
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
