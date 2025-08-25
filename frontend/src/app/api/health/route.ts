import { NextRequest, NextResponse } from 'next/server';

// Backend server configuration from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the Python backend health endpoint
    const backendResponse = await fetch(`${BACKEND_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('User-Agent') || 'DNSBunch-NextJS-Proxy',
      },
    });

    // Get response data
    const data = await backendResponse.json();

    // Return the response with the same status code from backend
    return NextResponse.json(data, {
      status: backendResponse.status,
    });

  } catch (error) {
    console.error('Health Check API Proxy Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to backend health service',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'HEALTH_CHECK_FAILED'
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
