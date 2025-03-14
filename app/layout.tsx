"use client"

import Script from "next/script"
import { AuthProvider } from "../src/contexts/AuthContext"
import { GuardiasProvider } from "../src/contexts/GuardiasContext"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "../src/App.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <GuardiasProvider>
            {children}
          </GuardiasProvider>
        </AuthProvider>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" />
      </body>
    </html>
  )
}
