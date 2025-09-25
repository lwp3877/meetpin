'use client'

import { useState, useEffect } from 'react'

interface StatusCheck {
  status: string
  responseTime: number
}

interface StatusData {
  version?: string
  gitSha?: string
  buildTime?: string
  uptime?: number
  timestamp: string
}

interface HealthData {
  status: string
  checks: {
    db: StatusCheck
    redis: StatusCheck
    stripeCfg: StatusCheck
    kakaoCfg: StatusCheck
  }
  totalResponseTime: number
}

interface ReadyData {
  status: string
  checks: {
    migrationsApplied: StatusCheck
    rateLimitPing: StatusCheck
    webhookReachable: StatusCheck
  }
  totalResponseTime: number
}

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [readyData, setReadyData] = useState<ReadyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllStatus()
    const interval = setInterval(fetchAllStatus, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchAllStatus = async () => {
    try {
      const [statusRes, healthRes, readyRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/healthz'),
        fetch('/api/ready')
      ])

      if (statusRes.ok) {
        setStatusData(await statusRes.json())
      }

      if (healthRes.ok) {
        setHealthData(await healthRes.json())
      } else {
        setHealthData({
          status: 'error',
          checks: { db: { status: 'error', responseTime: 0 }, redis: { status: 'error', responseTime: 0 }, stripeCfg: { status: 'error', responseTime: 0 }, kakaoCfg: { status: 'error', responseTime: 0 } },
          totalResponseTime: 0
        })
      }

      if (readyRes.ok) {
        setReadyData(await readyRes.json())
      } else {
        setReadyData({
          status: 'not_ready',
          checks: { migrationsApplied: { status: 'error', responseTime: 0 }, rateLimitPing: { status: 'error', responseTime: 0 }, webhookReachable: { status: 'error', responseTime: 0 } },
          totalResponseTime: 0
        })
      }

      setLoading(false)
      setError(null)
    } catch (err) {
      setError('Failed to fetch status data')
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ready':
      case 'configured':
      case 'applied':
        return '🟢'
      case 'not_configured':
      case 'not_ready':
        return '🟡'
      case 'degraded':
      case 'error':
      case 'timeout':
      case 'missing_tables':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const getOverallStatus = () => {
    if (!healthData || !readyData) return '⚪'

    if (healthData.status === 'healthy' && readyData.status === 'ready') {
      return '🟢'
    } else if (healthData.status === 'degraded' || readyData.status === 'not_ready') {
      return '🟡'
    }
    return '🔴'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            {getOverallStatus()} MeetPin Status
          </h1>
          <p className="text-gray-600 mt-2">System status and health monitoring</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          {/* Build Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📋 Build Information
            </h2>
            {statusData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Version</span>
                  <p className="font-mono">{statusData.version}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Git SHA</span>
                  <p className="font-mono">{statusData.gitSha}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Uptime</span>
                  <p className="font-mono">{Math.floor((statusData.uptime || 0) / 3600)}h {Math.floor(((statusData.uptime || 0) % 3600) / 60)}m</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Unable to fetch build information</p>
            )}
          </div>

          {/* Health Checks Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {getStatusIcon(healthData?.status || 'unknown')} Dependencies
            </h2>
            {healthData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Database</span>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(healthData.checks.db.status)}
                    <span className="text-sm text-gray-500">{healthData.checks.db.responseTime}ms</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Redis</span>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(healthData.checks.redis.status)}
                    <span className="text-sm text-gray-500">{healthData.checks.redis.responseTime}ms</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Stripe Config</span>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(healthData.checks.stripeCfg.status)}
                    <span className="text-sm text-gray-500">{healthData.checks.stripeCfg.responseTime}ms</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Kakao Config</span>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(healthData.checks.kakaoCfg.status)}
                    <span className="text-sm text-gray-500">{healthData.checks.kakaoCfg.responseTime}ms</span>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Unable to fetch health data</p>
            )}
          </div>

          {/* Readiness Checks Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {getStatusIcon(readyData?.status || 'unknown')} Readiness
            </h2>
            {readyData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Database Migrations</span>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(readyData.checks.migrationsApplied.status)}
                    <span className="text-sm text-gray-500">{readyData.checks.migrationsApplied.responseTime}ms</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Rate Limiting</span>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(readyData.checks.rateLimitPing.status)}
                    <span className="text-sm text-gray-500">{readyData.checks.rateLimitPing.responseTime}ms</span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Webhook Config</span>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(readyData.checks.webhookReachable.status)}
                    <span className="text-sm text-gray-500">{readyData.checks.webhookReachable.responseTime}ms</span>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Unable to fetch readiness data</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Status page refreshes automatically every 30 seconds</p>
          <p className="mt-1">
            <a href="/api/status" className="text-blue-600 hover:underline">JSON API</a>
            {' • '}
            <a href="/api/healthz" className="text-blue-600 hover:underline">Health</a>
            {' • '}
            <a href="/api/ready" className="text-blue-600 hover:underline">Readiness</a>
          </p>
        </div>
      </div>
    </div>
  )
}