import nodemailer, { type Transporter } from 'nodemailer'
import type { SmtpConfig } from '../config.js'
import type { OutgoingMail, Transport } from '../transport.js'

export function createNodemailerTransport(config: SmtpConfig): Transport {
  const transporter: Transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
  })

  return {
    async send(mail: OutgoingMail): Promise<{ id: string }> {
      const info = await transporter.sendMail({
        from: mail.from,
        to: mail.to.join(', '),
        cc: mail.cc?.join(', '),
        bcc: mail.bcc?.join(', '),
        replyTo: mail.replyTo,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        headers: mail.headers,
        attachments: mail.attachments?.map((a) => ({
          filename: a.filename,
          contentType: a.contentType,
          content: a.content,
          cid: a.cid,
        })),
      })

      return { id: info.messageId }
    },
  }
}
