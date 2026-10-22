import type { ResendConfig } from '../config.js'
import type { OutgoingMail, Transport } from '../transport.js'

const RESEND_API_URL = 'https://api.resend.com/emails'

export function createResendTransport(config: ResendConfig): Transport {
  return {
    async send(mail: OutgoingMail): Promise<{ id: string }> {
      const payload = {
        from: mail.from,
        to: mail.to,
        cc: mail.cc,
        bcc: mail.bcc,
        reply_to: mail.replyTo,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        headers: mail.headers,
        attachments: mail.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
      }

      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Resend API error (${response.status}): ${errorBody}`)
      }

      const data = (await response.json()) as { id: string }
      return { id: data.id }
    },
  }
}
