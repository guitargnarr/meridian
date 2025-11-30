import { NextResponse } from 'next/server'
import { sendSlackMessage, createDailyReportMessage } from '@/lib/slack'

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch analytics from our own API
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phishguard-ui.vercel.app'
    const analyticsResponse = await fetch(`${siteUrl}/api/analytics`)

    if (!analyticsResponse.ok) {
      throw new Error('Failed to fetch analytics')
    }

    const stats = await analyticsResponse.json()

    if (!SLACK_WEBHOOK_URL) {
      return NextResponse.json({
        success: false,
        error: 'Webhook not configured'
      })
    }

    // Only send report if there's activity
    if (stats.totalAnalyses === 0) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'No activity to report'
      })
    }

    const message = createDailyReportMessage(stats)
    const sent = await sendSlackMessage(SLACK_WEBHOOK_URL, message)

    return NextResponse.json({
      success: sent,
      stats
    })
  } catch (error) {
    console.error('Daily report error:', error)
    return NextResponse.json(
      { error: 'Failed to send daily report' },
      { status: 500 }
    )
  }
}
