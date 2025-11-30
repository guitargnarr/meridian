// Shared Slack utilities for PhishGuard

export interface SlackBlock {
  type: string
  text?: {
    type: string
    text: string
    emoji?: boolean
  }
  fields?: Array<{
    type: string
    text: string
  }>
  elements?: Array<{
    type: string
    text?: string
    action_id?: string
    url?: string
    style?: string
  }>
  accessory?: {
    type: string
    text: {
      type: string
      text: string
      emoji?: boolean
    }
    url?: string
    action_id?: string
    style?: string
  }
}

export interface SlackMessage {
  text?: string
  blocks: SlackBlock[]
}

export async function sendSlackMessage(
  webhookUrl: string,
  message: SlackMessage
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
    return response.ok
  } catch (error) {
    console.error('Slack webhook error:', error)
    return false
  }
}

export function createThreatAlertMessage(
  emailSnippet: string,
  confidence: number,
  threatLevel: string,
  siteUrl: string
): SlackMessage {
  const confidencePercent = (confidence * 100).toFixed(1)
  const truncatedSnippet = emailSnippet.length > 500
    ? emailSnippet.substring(0, 500) + '...'
    : emailSnippet

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'High-Risk Phishing Email Detected',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Confidence:* ${confidencePercent}%\n*Threat Level:* ${threatLevel}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Email Preview:*\n\`\`\`${truncatedSnippet}\`\`\``
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '_A user just analyzed this suspicious email on PhishGuard_'
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Schedule Demo',
            emoji: true
          },
          url: `${siteUrl}/?demo=true&source=threat-alert`,
          action_id: 'schedule_demo',
          style: 'primary'
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Detected at ${new Date().toISOString()}`
          }
        ]
      }
    ]
  }
}

export function createFeedbackMessage(
  emailSnippet: string,
  reportedAs: 'false_positive' | 'false_negative',
  originalResult: {
    is_phishing: boolean
    confidence: number
  }
): SlackMessage {
  const truncatedSnippet = emailSnippet.length > 300
    ? emailSnippet.substring(0, 300) + '...'
    : emailSnippet

  const reportType = reportedAs === 'false_positive'
    ? 'False Positive (marked phishing but is safe)'
    : 'False Negative (marked safe but is phishing)'

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Model Feedback Report',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Report Type:*\n${reportType}` },
          { type: 'mrkdwn', text: `*Original Confidence:*\n${(originalResult.confidence * 100).toFixed(1)}%` }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Email Sample:*\n\`\`\`${truncatedSnippet}\`\`\``
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Reported at ${new Date().toISOString()}`
          }
        ]
      }
    ]
  }
}

export function createDailyReportMessage(
  stats: {
    totalAnalyses: number
    phishingDetected: number
    safeEmails: number
    avgConfidence: number
    highRiskCount: number
  }
): SlackMessage {
  const phishingRate = stats.totalAnalyses > 0
    ? ((stats.phishingDetected / stats.totalAnalyses) * 100).toFixed(1)
    : '0'

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'PhishGuard Daily Report',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Total Analyses:*\n${stats.totalAnalyses}` },
          { type: 'mrkdwn', text: `*Phishing Detected:*\n${stats.phishingDetected}` },
          { type: 'mrkdwn', text: `*Safe Emails:*\n${stats.safeEmails}` },
          { type: 'mrkdwn', text: `*Phishing Rate:*\n${phishingRate}%` }
        ]
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Avg Confidence:*\n${(stats.avgConfidence * 100).toFixed(1)}%` },
          { type: 'mrkdwn', text: `*High-Risk Alerts:*\n${stats.highRiskCount}` }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Report generated ${new Date().toISOString()}`
          }
        ]
      }
    ]
  }
}
