import { NextResponse } from 'next/server'
import { sendSlackMessage, createFeedbackMessage } from '@/lib/slack'

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

export async function POST(request: Request) {
  try {
    const { emailText, reportedAs, originalResult } = await request.json()

    if (!emailText || !reportedAs || !originalResult) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['false_positive', 'false_negative'].includes(reportedAs)) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      )
    }

    if (!SLACK_WEBHOOK_URL) {
      console.warn('SLACK_WEBHOOK_URL not configured')
      return NextResponse.json({
        success: true,
        sent: false,
        reason: 'Webhook not configured'
      })
    }

    const message = createFeedbackMessage(
      emailText,
      reportedAs,
      originalResult
    )

    const sent = await sendSlackMessage(SLACK_WEBHOOK_URL, message)

    return NextResponse.json({
      success: true,
      sent
    })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
