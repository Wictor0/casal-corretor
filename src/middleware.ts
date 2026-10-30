import { NextResponse, type NextRequest } from 'next/server';

// www.casalcorretoroficial.com.br → casalcorretoroficial.com.br (um endereço só)
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  if (host.startsWith('www.')) {
    const url = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${host.slice(4)}`);
    return NextResponse.redirect(url, 301);
  }
}
export const config = { matcher: '/((?!_next/|midia/).*)' };
