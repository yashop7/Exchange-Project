import { NextRequest, NextResponse } from 'next/server';

// Define the Trade type if not already imported
interface Trade {
  id: string;
  price: string;
  quantity: string;
  timestamp: number;
  isBuyerMaker: boolean;
  side: 'BUY' | 'SELL';
}

const BASE_URL = 'https://api.backpack.exchange/api/v1';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get URL parameters using NextRequest
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'BTC_USDC';
    const limit = searchParams.get('limit') || '50';

    // Validate parameters
    if (parseInt(limit) > 1000) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 1000' },
        { status: 400 }
      );
    }

    // Construct the URL with encoded parameters
    const url = new URL(`${BASE_URL}/trades`);
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('limit', limit);


    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add cache control
      next: {
        revalidate: 10 // Revalidate every 10 seconds
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data: Trade[] = await response.json();

    // Add CORS headers
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    return NextResponse.json(data, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error('Failed to fetch trades:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}