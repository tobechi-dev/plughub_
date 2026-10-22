import { z } from 'zod'

const ResendConfigSchema = z.object({
  apiKey: z.string().min(1),
})

export type ResendConfig = z.infer<typeof ResendConfigSchema>

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ResendConfig {
  const result = ResendConfigSchema.safeParse({
    apiKey: env.RESEND_API_KEY,
  })

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid Resend configuration:\n${issues}`)
  }

  return result.data
}
