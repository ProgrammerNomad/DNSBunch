import { NextRequest, NextResponse } from 'next/server';

// Backend server configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the Python backend
    const backendResponse = await fetch(`${BACKEND_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();

    // Return the response with proper CORS headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Health API Proxy Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Backend service unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 503,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
