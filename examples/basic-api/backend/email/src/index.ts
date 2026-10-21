export { createAdapter, type EmailAdapter } from './adapter.js'
export { loadConfig, type SmtpConfig } from './config.js'
export { createEmailService, type EmailService } from './lib.js'
export type {
  Attachment,
  EmailAddress,
  EmailRecord,
  EmailStatus,
  SendEmailInput,
  SendEmailResult,
} from './schemas.js'
export { createServer } from './server.js'
export { createInMemoryStore, type EmailStore } from './store.js'
export { createNodemailerTransport } from './transports/nodemailer.js'
