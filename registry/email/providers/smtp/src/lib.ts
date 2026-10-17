import { createAdapter, type EmailAdapter } from './adapter.js'
import type { SmtpConfig } from './config.js'
import type { EmailRecord, SendEmailInput, SendEmailResult } from './schemas.js'
import { createInMemoryStore } from './store.js'
import { createNodemailerTransport } from './transports/nodemailer.js'

export interface EmailService {
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>
  getEmailStatus(id: string): Promise<EmailRecord | undefined>
}

/**
 * Create an in-process email service.
 *
 * Unlike the HTTP server in `index.ts`, this runs entirely in the caller's
 * process — no port, no separate deployment. Use it when your app and the
 * provider share a runtime (Node, Next.js server actions, etc.).
 *
 * For polyglot setups or service isolation, run the HTTP service instead.
 */
export function createEmailService(config: SmtpConfig): EmailService {
  const transport = createNodemailerTransport(config)
  const adapter: EmailAdapter = createAdapter(transport, createInMemoryStore())

  return {
    sendEmail: (input) => adapter.send(input),
    getEmailStatus: (id) => adapter.getStatus(id),
  }
}
