import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { DB_CONFIG } from "@/lib/db-config"

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user')?.value
  const isAuthPage = request.nextUrl.pathname === DB_CONFIG.RUTAS.LOGIN
  const user = userCookie ? JSON.parse(userCookie) : null

  // If no user and not on login page, redirect to login
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL(DB_CONFIG.RUTAS.LOGIN, request.url))
  }

  // If user is logged in and tries to access login page
  if (user && isAuthPage) {
    const redirectUrl = user.rol === DB_CONFIG.ROLES.ADMIN ? DB_CONFIG.RUTAS.ADMIN : DB_CONFIG.RUTAS.PROFESOR
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // If user tries to access unauthorized routes
  if (user) {
    const isAdminRoute = request.nextUrl.pathname.startsWith(DB_CONFIG.RUTAS.ADMIN)
    const isProfesorRoute = request.nextUrl.pathname.startsWith(DB_CONFIG.RUTAS.PROFESOR)

    if (isAdminRoute && user.rol !== DB_CONFIG.ROLES.ADMIN) {
      return NextResponse.redirect(new URL(DB_CONFIG.RUTAS.PROFESOR, request.url))
    }

    if (isProfesorRoute && user.rol !== DB_CONFIG.ROLES.PROFESOR) {
      return NextResponse.redirect(new URL(DB_CONFIG.RUTAS.ADMIN, request.url))
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