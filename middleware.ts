import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.redirect('https://projectlavos.com', 302);
}

export const config = {
  matcher: '/:path*',
};
