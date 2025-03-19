"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DB_CONFIG } from "@/lib/db-config"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push(DB_CONFIG.RUTAS.LOGIN)
  }, [router])

  return null
}