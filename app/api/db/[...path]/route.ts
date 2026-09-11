import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return handleProxy(req, params.path);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return handleProxy(req, params.path);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return handleProxy(req, params.path);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return handleProxy(req, params.path);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return handleProxy(req, params.path);
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204 });
}

async function handleProxy(req: NextRequest, pathArray: string[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!supabaseUrl) {
    return NextResponse.json({ error: 'Supabase URL missing' }, { status: 500 });
  }

  const targetUrl = new URL(req.url);
  // Reconstruct the path for Supabase
  const pathString = pathArray.join('/');
  
  const finalUrl = `${supabaseUrl}/${pathString}${targetUrl.search}`;

  const headers = new Headers(req.headers);
  
  // In development, we inject the SERVICE_ROLE_KEY to bypass RLS since there's no real login
  if (isDev) {
    const serviceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      headers.set('apikey', serviceKey);
      headers.set('Authorization', `Bearer ${serviceKey}`);
    }
  }

  // Remove host header so fetch doesn't get confused
  headers.delete('host');
  // Also remove origin to avoid CORS issues with Supabase locally
  headers.delete('origin');
  headers.delete('referer');

  try {
    const response = await fetch(finalUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('access-control-allow-origin', '*');
    
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length'); // length might change after decompression

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Supabase Dev Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
