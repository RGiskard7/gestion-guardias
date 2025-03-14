import ProtectedLayout from "@/components/layout/protected-layout"

export default function SalaGuardiasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
} 