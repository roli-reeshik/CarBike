import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { endpoint, method = 'GET', headers = {}, params = {} } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint URL is required' }, { status: 400 });
    }

    const url = new URL(endpoint);
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.set(key, String(val));
      }
    });

    const startTime = Date.now();
    const response = await fetch(url.toString(), {
      method,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      cache: 'no-store',
    });

    const latency = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || '';
    let data: any = null;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      latencyMs: latency,
      urlCalled: url.toString(),
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to execute API request' },
      { status: 500 }
    );
  }
}