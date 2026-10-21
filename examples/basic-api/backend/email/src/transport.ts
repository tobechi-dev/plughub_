export interface OutgoingMail {
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  subject: string
  text?: string
  html?: string
  headers?: Record<string, string>
  attachments?: Array<{
    filename: string
    contentType: string
    content: string
    cid?: string
  }>
}

export interface Transport {
  send(mail: OutgoingMail): Promise<{ id: string }>
}
