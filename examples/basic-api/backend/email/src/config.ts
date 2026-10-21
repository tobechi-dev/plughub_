import { z } from 'zod'

const SmtpConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().positive(),
  user: z.string().min(1),
  password: z.string().min(1),
  secure: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
})

export type SmtpConfig = z.infer<typeof SmtpConfigSchema>

export function loadConfig(env: NodeJS.ProcessEnv = process.env): SmtpConfig {
  const result = SmtpConfigSchema.safeParse({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    secure: env.SMTP_SECURE,
  })

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid SMTP configuration:\n${issues}`)
  }

  return result.data
}
