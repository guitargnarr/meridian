import { NextResponse } from 'next/server'

// In-memory store for analytics (in production, use a database)
// This persists across requests but resets on cold starts
const analyticsStore: {
  events: Array<{
    timestamp: string
    type: string
    data: Record<string, unknown>
  }>
  lastReset: string
} = {
  events: [],
  lastReset: new Date().toISOString()
}

export async function POST(request: Request) {
  try {
    const { events } = await request.json()

    if (Array.isArray(events)) {
      // Dedupe by timestamp and merge
      const existingTimestamps = new Set(analyticsStore.events.map(e => e.timestamp))
      const newEvents = events.filter(
        (e: { timestamp: string }) => !existingTimestamps.has(e.timestamp)
      )

      analyticsStore.events.push(...newEvents)

      // Keep only last 10000 events
      if (analyticsStore.events.length > 10000) {
        analyticsStore.events = analyticsStore.events.slice(-10000)
      }
    }

    return NextResponse.json({ success: true, count: analyticsStore.events.length })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to store analytics' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Calculate stats from stored events
  const analyses = analyticsStore.events.filter(e => e.type === 'analysis')

  const phishingDetected = analyses.filter(e => e.data.is_phishing).length
  const safeEmails = analyses.filter(e => !e.data.is_phishing).length
  const highRiskCount = analyses.filter(
    e => e.data.is_phishing && (e.data.confidence as number || 0) >= 0.90
  ).length

  const confidences = analyses
    .map(e => (e.data.confidence as number) || 0)
    .filter(c => c > 0)

  const avgConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0

  return NextResponse.json({
    totalAnalyses: analyses.length,
    phishingDetected,
    safeEmails,
    avgConfidence,
    highRiskCount,
    lastReset: analyticsStore.lastReset,
    lastUpdated: new Date().toISOString()
  })
}
