import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass internal Next.js assets, API endpoints, vehicle public media, and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/vehicles') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    try {
      const authValue = basicAuth.split(' ')[1];
      const decoded = atob(authValue);
      const [user, pwd] = decoded.split(':');

      const validUser = process.env.DEMO_USER || 'Guest';
      const validPassword = process.env.DEMO_PASSWORD || 'CarBike@2026';

      if (user === validUser && pwd === validPassword) {
        return NextResponse.next();
      }
    } catch {
      // In case of malformed base64 headers, fallback to challenge
    }
  }

  return new NextResponse('Authentication Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Demo Portal"',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
