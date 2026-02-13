import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip redirect in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }
  return NextResponse.redirect('https://projectlavos.com', 302);
}

export const config = {
  matcher: '/:path*',
};
