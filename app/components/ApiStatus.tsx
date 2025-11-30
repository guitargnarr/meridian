'use client'

import { useEffect, useState } from 'react'
import { Activity, CheckCircle, XCircle } from 'lucide-react'

const API_URL = 'https://phishguard-api-production-88df.up.railway.app'

interface HealthStatus {
  status: string
  simple_model_loaded: boolean
  endpoints: string[]
}

export function ApiStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/health`, {
          cache: 'no-store'
        })
        if (response.ok) {
          const data = await response.json()
          setHealth(data)
          setError(false)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Activity className="h-4 w-4 animate-pulse" />
        <span>Checking API...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-400">
        <XCircle className="h-4 w-4" />
        <span>API Offline</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-400">
      <CheckCircle className="h-4 w-4" />
      <span>API Online</span>
      {health?.simple_model_loaded && (
        <span className="text-slate-500">| ML Model Ready</span>
      )}
    </div>
  )
}
