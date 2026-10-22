import { createAdapter, type EmailAdapter } from './adapter.js'
import type { ResendConfig } from './config.js'
import type { EmailRecord, SendEmailInput, SendEmailResult } from './schemas.js'
import { createInMemoryStore } from './store.js'
import { createResendTransport } from './transports/resend.js'

export interface EmailService {
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>
  getEmailStatus(id: string): Promise<EmailRecord | undefined>
}

export function createEmailService(config: ResendConfig): EmailService {
  const transport = createResendTransport(config)
  const adapter: EmailAdapter = createAdapter(transport, createInMemoryStore())

  return {
    sendEmail: (input) => adapter.send(input),
    getEmailStatus: (id) => adapter.getStatus(id),
  }
}
