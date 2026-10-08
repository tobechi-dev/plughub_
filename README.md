# Plughub

> An open registry and CLI for pluggable backend services. Add auth, email, storage, and jobs to any app — contract-first, self-hosted, no lock-in.

[![CI](https://github.com/<you>/backkit/actions/workflows/ci.yml/badge.svg)](https://github.com/<you>/backkit/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

## What is this?

`backkit` lets you add backend capabilities to your app the same way you add UI components. Instead of adopting a monolithic BaaS, you pick the capabilities you need, pick the provider you want, and the CLI generates the code, config, and infrastructure into your repo.

You own the code. You can run it locally, self-host it, or swap in a managed provider later.

## Quick start

```bash
npx backkit init
npx backkit add email
npx backkit up
