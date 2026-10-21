import { z } from 'zod'

export const EmailAddressSchema = z.object({
  address: z.string().email(),
  name: z.string().optional(),
})

export const AttachmentSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  content: z.string().min(1),
  contentId: z.string().optional(),
})

export const EmailStatusSchema = z.enum([
  'queued',
  'sent',
  'delivered',
  'bounced',
  'complained',
  'failed',
])

export const SendEmailInputSchema = z.object({
  from: EmailAddressSchema,
  to: z.array(EmailAddressSchema).min(1),
  cc: z.array(EmailAddressSchema).optional(),
  bcc: z.array(EmailAddressSchema).optional(),
  replyTo: EmailAddressSchema.optional(),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
  headers: z.record(z.string()).optional(),
  attachments: z.array(AttachmentSchema).optional(),
  tags: z.array(z.string()).optional(),
})

export const SendEmailResultSchema = z.object({
  id: z.string(),
  status: EmailStatusSchema,
  createdAt: z.string().datetime(),
})

export const EmailRecordSchema = SendEmailResultSchema.extend({
  updatedAt: z.string().datetime(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
})

export const ErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

export type EmailAddress = z.infer<typeof EmailAddressSchema>
export type Attachment = z.infer<typeof AttachmentSchema>
export type EmailStatus = z.infer<typeof EmailStatusSchema>
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>
export type SendEmailResult = z.infer<typeof SendEmailResultSchema>
export type EmailRecord = z.infer<typeof EmailRecordSchema>
