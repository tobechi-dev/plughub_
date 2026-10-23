# Contributing to Plughub

Thanks for your interest in contributing to Plughub! We're building the standard for pluggable backend services, and we're glad you're here.

## Getting Started

We use a **pnpm monorepo** powered by **Turborepo**.

### Prerequisites

- Node.js `v22.11` or higher
- pnpm `v9` or higher

### Setup

1. Fork and clone the repository.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build all packages to ensure everything is wired up:

   ```bash
   pnpm build
   ```

4. Run the test suite:

   ```bash
   pnpm test
   ```

## Repository Structure

- `apps/cli` — The backkit CLI tool.
- `packages/core` — Shared Zod schemas, manifest parsing, and validation.
- `registry/*` — The actual capabilities and providers (e.g., `registry/email`).
- `examples/basic-api` — An integration test disguised as an example Express app.

## How to Contribute

### Adding a Provider to an Existing Capability

If you want to add a new provider (e.g., SendGrid for Email, or GCS for Storage):

1. Copy an existing provider directory (e.g., `cp -r registry/email/providers/resend registry/email/providers/sendgrid`).

2. Update the `package.json` name.
3. Update `provider.yaml` with the new config requirements.
4. Implement the transport/adapter in `src/`.
5. Ensure the new provider passes the contract tests:

   ```bash
   pnpm --filter @plughub/provider-email-sendgrid test
   ```

### Adding a New Capability

If you want to add a completely new capability (e.g., Auth, Payments, Search):

1. Create a new folder in `registry/` (e.g., `registry/auth`).
2. Define the `capability.yaml` and `openapi.yaml`.
3. Scaffold a provider inside `providers/`.
4. Add validation tests to `packages/core/src/registry/validate.test.ts`.

## Development Workflow

We follow standard open-source practices to keep the project stable.

### 1. Branching

Create a branch off `main` with a descriptive name:

- `feat/add-sendgrid-provider`
- `fix/cli-add-command`
- `docs/update-readme`

### 2. Commit Messages

We use **Conventional Commits**. This allows our release pipeline to auto-generate changelogs.

Your commits must start with one of the following:

- `feat:` (A new feature)
- `fix:` (A bug fix)
- `docs:` (Documentation changes)
- `chore:` (Tooling, dependencies, or maintenance)

Example:

```text
feat(provider): add sendgrid email provider
```

### 3. Changesets

Because we use Changesets to manage versioning, any PR that changes code (features or fixes) must include a changeset.

Run:

```bash
pnpm changeset
```

Follow the prompts to select the affected packages and describe the change. Commit the generated `.md` file in your PR.

### 4. Pull Requests

- Make sure `pnpm test` passes locally.
- Make sure `pnpm typecheck` passes locally.
- Make sure `pnpm lint` passes locally.
- Open a PR against `main`.
- CI must pass before a maintainer can merge.
