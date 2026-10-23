# Plughub

> An open registry and CLI for pluggable backend services. Add auth, email, storage, and jobs to any app — contract-first, self-hosted, no lock-in.

The **CLI** is called **`backkit`**.

[![CI](https://github.com/tobechi-dev/plughub_/actions/workflows/ci.yml/badge.svg)](https://github.com/tobechi-dev/plughub_/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

## What is this?

`backkit` lets you add backend capabilities to your app the same way you add UI components. Instead of adopting a monolithic BaaS, you pick the capabilities you need, pick the provider you want, and the CLI generates the code, config, and infrastructure directly into your repo.

You own the code. You can run it locally, self-host it, or swap in a managed provider later.

### The "Contract-First" Approach

Every capability (like `email` or `storage`) has a strict OpenAPI/AsyncAPI contract. Every provider (like SMTP, Resend, or AWS S3) must pass contract tests to be added to the registry. This means you can swap an SMTP server for a managed HTTP API without changing a single line of your application code.

## Available Capabilities

| Capability  | Providers        | Description                                                                         |
| :---------- | :--------------- | :---------------------------------------------------------------------------------- |
| **Email**   | `smtp`, `resend` | Send transactional emails via raw SMTP or modern HTTP APIs.                         |
| **Storage** | `s3`             | Upload, download, and delete files from any S3-compatible storage (AWS, MinIO, R2). |

## Quick Start

_(Note: The CLI is currently available via source. `npx` support is coming soon!)_

```bash
# 1. Add the email capability to your project (requires local CLI)
backkit add email --provider resend

# 2. Add the storage capability
backkit add storage --provider s3
```

The CLI will scaffold the provider into your `./backend/` folder, tell you which dependencies to install, and provide a checklist of environment variables you need to set.

## Repository Structure

- `apps/cli` — The backkit command-line tool.
- `packages/core` — Shared Zod schemas, manifest parsing, and validation.
- `registry/*` — The capabilities and providers (e.g., `registry/email`, `registry/storage`).
- `examples/basic-api` — A working Express app demonstrating Email and Storage integration.

## Why Plughub?

- **Composable.** Add only what you need. No giant SDK, no all-or-nothing platform.
- **Contract-first.** Providers are swappable because they implement identical contracts.
- **Self-hosted first.** Local development is straightforward. Managed providers are an option, not a requirement.
- **You own the code.** The CLI writes real files into your repo. No runtime magic, no black boxes.

## Contributing

We love contributions! Whether it's adding a new provider (like SendGrid or GCS), fixing a bug, or improving docs, please read our [Contributing Guide](./CONTRIBUTING.md) to get started.

## License

Apache-2.0
