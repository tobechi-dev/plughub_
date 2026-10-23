import { z } from 'zod'

const S3ConfigSchema = z.object({
  endpoint: z.string().url(),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  region: z.string().default('us-east-1'),
})

export type S3Config = z.infer<typeof S3ConfigSchema>

export function loadConfig(env: NodeJS.ProcessEnv = process.env): S3Config {
  const result = S3ConfigSchema.safeParse({
    endpoint: env.S3_ENDPOINT,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    region: env.S3_REGION,
  })

  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid S3 configuration:\n${issues}`)
  }

  return result.data
}
