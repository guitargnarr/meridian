// Client-side analytics tracking for PhishGuard

const STORAGE_KEY = 'phishguard_analytics'

export interface AnalyticsEvent {
  timestamp: string
  type: 'analysis' | 'threat_alert' | 'demo_request' | 'feedback'
  data: {
    is_phishing?: boolean
    confidence?: number
    threatLevel?: string
    feedbackType?: string
  }
}

export interface AnalyticsStats {
  totalAnalyses: number
  phishingDetected: number
  safeEmails: number
  avgConfidence: number
  highRiskCount: number
  lastUpdated: string
}

// Get stored analytics (client-side only)
export function getStoredAnalytics(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Store analytics event (client-side only)
export function trackAnalysis(
  isPhishing: boolean,
  confidence: number,
  threatLevel?: string
): void {
  if (typeof window === 'undefined') return

  const events = getStoredAnalytics()

  // Keep only last 1000 events to prevent storage bloat
  if (events.length >= 1000) {
    events.shift()
  }

  events.push({
    timestamp: new Date().toISOString(),
    type: 'analysis',
    data: {
      is_phishing: isPhishing,
      confidence,
      threatLevel
    }
  })

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch {
    // Storage full, clear old data
    localStorage.removeItem(STORAGE_KEY)
  }

  // Send to server for aggregation
  sendToServer(events)
}

// Calculate stats from events
export function calculateStats(events: AnalyticsEvent[]): AnalyticsStats {
  const analyses = events.filter(e => e.type === 'analysis')

  const phishingDetected = analyses.filter(e => e.data.is_phishing).length
  const safeEmails = analyses.filter(e => !e.data.is_phishing).length
  const highRiskCount = analyses.filter(
    e => e.data.is_phishing && (e.data.confidence || 0) >= 0.90
  ).length

  const confidences = analyses
    .map(e => e.data.confidence || 0)
    .filter(c => c > 0)

  const avgConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0

  return {
    totalAnalyses: analyses.length,
    phishingDetected,
    safeEmails,
    avgConfidence,
    highRiskCount,
    lastUpdated: new Date().toISOString()
  }
}

// Send analytics to server (fire and forget)
async function sendToServer(events: AnalyticsEvent[]): Promise<void> {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: events.slice(-100) }) // Send last 100 only
    })
  } catch {
    // Silently fail - analytics shouldn't block UX
  }
}

// Get today's events only
export function getTodayEvents(): AnalyticsEvent[] {
  const events = getStoredAnalytics()
  const today = new Date().toISOString().split('T')[0]

  return events.filter(e => e.timestamp.startsWith(today))
}
