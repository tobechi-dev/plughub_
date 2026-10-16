import type { EmailRecord, SendEmailInput, SendEmailResult } from './schemas.js'
import type { EmailStore } from './store.js'
import type { OutgoingMail, Transport } from './transport.js'

export interface EmailAdapter {
  send(input: SendEmailInput): Promise<SendEmailResult>
  getStatus(id: string): Promise<EmailRecord | undefined>
}

export function createAdapter(transport: Transport, store: EmailStore): EmailAdapter {
  return {
    async send(input) {
      const { id } = await transport.send(toOutgoingMail(input))
      const now = new Date().toISOString()

      const record: EmailRecord = {
        id,
        status: 'sent',
        createdAt: now,
        updatedAt: now,
      }
      store.save(record)

      return { id, status: 'sent', createdAt: now }
    },

    async getStatus(id) {
      return store.get(id)
    },
  }
}

function toOutgoingMail(input: SendEmailInput): OutgoingMail {
  return {
    from: formatAddress(input.from),
    to: input.to.map(formatAddress),
    cc: input.cc?.map(formatAddress),
    bcc: input.bcc?.map(formatAddress),
    replyTo: input.replyTo ? formatAddress(input.replyTo) : undefined,
    subject: input.subject,
    text: input.text,
    html: input.html,
    headers: input.headers,
    attachments: input.attachments?.map((a) => ({
      filename: a.filename,
      contentType: a.contentType,
      content: a.content,
      cid: a.contentId,
    })),
  }
}

function formatAddress(addr: { address: string; name?: string }): string {
  return addr.name ? `"${addr.name}" <${addr.address}>` : addr.address
}
