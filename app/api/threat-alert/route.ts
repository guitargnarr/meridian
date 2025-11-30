import { NextResponse } from 'next/server'
import { sendSlackMessage, createThreatAlertMessage } from '@/lib/slack'

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

export async function POST(request: Request) {
  try {
    const { emailText, confidence, threatLevel } = await request.json()

    if (!emailText || confidence === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Only alert for high-confidence threats (90%+)
    if (confidence < 0.90) {
      return NextResponse.json({
        success: true,
        alerted: false,
        reason: 'Below confidence threshold'
      })
    }

    if (!SLACK_WEBHOOK_URL) {
      console.warn('SLACK_WEBHOOK_URL not configured')
      return NextResponse.json({
        success: true,
        alerted: false,
        reason: 'Webhook not configured'
      })
    }

    // Get site URL for the demo button
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phishguard-ui.vercel.app'

    const message = createThreatAlertMessage(
      emailText,
      confidence,
      threatLevel || 'High',
      siteUrl
    )

    const sent = await sendSlackMessage(SLACK_WEBHOOK_URL, message)

    return NextResponse.json({
      success: true,
      alerted: sent,
      confidence
    })
  } catch (error) {
    console.error('Threat alert error:', error)
    return NextResponse.json(
      { error: 'Failed to send threat alert' },
      { status: 500 }
    )
  }
}
