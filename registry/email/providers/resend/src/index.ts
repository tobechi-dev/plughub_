export { createEmailService, type EmailService } from './lib.js'
export { createAdapter, type EmailAdapter } from './adapter.js'
export { createServer } from './server.js'
export { createResendTransport } from './transports/resend.js'
export { createInMemoryStore, type EmailStore } from './store.js'
export { loadConfig, type ResendConfig } from './config.js'
export type {
  Attachment,
  EmailAddress,
  EmailRecord,
  EmailStatus,
  SendEmailInput,
  SendEmailResult,
} from './schemas.js'
