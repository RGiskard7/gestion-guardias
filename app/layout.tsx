import Script from "next/script"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/src/contexts/AuthContext"
import { UsuariosProvider } from "@/src/contexts/UsuariosContext"
import { LugaresProvider } from "@/src/contexts/LugaresContext"
import { HorariosProvider } from "@/src/contexts/HorariosContext"
import { AusenciasProvider } from "@/src/contexts/AusenciasContext"
import { GuardiasProvider } from "@/src/contexts/GuardiasContext"
import { ThemeProvider } from "@/src/contexts/ThemeContext"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "@/src/App.css"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Gestión de Guardias',
  description: 'Sistema de gestión de guardias para centros educativos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <UsuariosProvider>
              <LugaresProvider>
                <HorariosProvider>
                  <AusenciasProvider>
                    <GuardiasProvider>
                      <div className="relative flex min-h-screen flex-col">
                        <div className="flex-1">{children}</div>
                      </div>
                    </GuardiasProvider>
                  </AusenciasProvider>
                </HorariosProvider>
              </LugaresProvider>
            </UsuariosProvider>
          </AuthProvider>
        </ThemeProvider>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossOrigin="anonymous" />
      </body>
    </html>
  )
}
