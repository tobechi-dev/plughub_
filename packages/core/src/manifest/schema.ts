import { z } from 'zod'

// --- Primitives ---

const IdSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z][a-z0-9-]*$/,
    'Must be lowercase, start with a letter, and contain only letters, digits, and hyphens',
  )

const SemverSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+(?:-[\w.]+)?$/, 'Must be a valid semver version')

const StatusSchema = z.enum(['experimental', 'beta', 'stable'])

// --- Capability ---

const ContractRefSchema = z.object({
  type: z.enum(['openapi', 'asyncapi', 'json-schema']),
  path: z.string().min(1),
})

const ExportSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  signature: z.string().optional(),
})

export const CapabilityManifestSchema = z.object({
  schemaVersion: z.literal('1'),
  kind: z.literal('capability'),
  id: IdSchema,
  version: SemverSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  status: StatusSchema,
  contracts: z.array(ContractRefSchema).min(1),
  exports: z.array(ExportSchema).min(1),
  tags: z.array(z.string()).default([]),
})

// --- Provider ---

const ConfigFieldSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('string'),
    required: z.boolean().default(true),
    description: z.string().min(1),
    default: z.string().optional(),
    secret: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('number'),
    required: z.boolean().default(true),
    description: z.string().min(1),
    default: z.number().optional(),
  }),
  z.object({
    type: z.literal('boolean'),
    required: z.boolean().default(true),
    description: z.string().min(1),
    default: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('enum'),
    required: z.boolean().default(true),
    description: z.string().min(1),
    values: z.array(z.string()).min(1),
    default: z.string().optional(),
  }),
])

const DeploySchema = z.object({
  type: z.enum(['docker', 'process', 'none']),
  compose: z.string().optional(),
  notes: z.string().optional(),
})

export const ProviderManifestSchema = z.object({
  schemaVersion: z.literal('1'),
  kind: z.literal('provider'),
  id: IdSchema,
  capability: IdSchema,
  version: SemverSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  status: StatusSchema,
  selfHosted: z.boolean(),
  managed: z.boolean(),
  language: z.enum(['typescript', 'javascript', 'go', 'python', 'rust']),
  config: z.record(z.string(), ConfigFieldSchema).default({}),
  deploy: DeploySchema.optional(),
  contractTest: z.string().optional(),
})

// --- Union ---

export const ManifestSchema = z.discriminatedUnion('kind', [
  CapabilityManifestSchema,
  ProviderManifestSchema,
])

export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>
export type ProviderManifest = z.infer<typeof ProviderManifestSchema>
export type Manifest = z.infer<typeof ManifestSchema>
export type ConfigField = z.infer<typeof ConfigFieldSchema>
export type ContractRef = z.infer<typeof ContractRefSchema>
export type ExportDef = z.infer<typeof ExportSchema>
