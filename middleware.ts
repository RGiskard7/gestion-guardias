import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')?.value
  const isAuthPage = request.nextUrl.pathname === '/login'
  const user = userCookie ? JSON.parse(userCookie) : null

  // If no user and not on login page, redirect to login
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and tries to access login page
  if (user && isAuthPage) {
    const redirectUrl = user.rol === 'admin' ? '/admin' : '/profesor'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // If user tries to access unauthorized routes
  if (user) {
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isProfesorRoute = request.nextUrl.pathname.startsWith('/profesor')

    if (isAdminRoute && user.rol !== 'admin') {
      return NextResponse.redirect(new URL('/profesor', request.url))
    }

    if (isProfesorRoute && user.rol !== 'profesor') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profesor/:path*',
    '/sala-guardias/:path*',
    '/login'
  ]
} 