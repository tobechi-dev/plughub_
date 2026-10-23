# Security Policy

## Supported Versions

Plughub is currently in early development. Security updates will be applied to the latest minor version.

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please send an email to `ejiofortobechi@gmail.com`.

Please include:

- A description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact (e.g., exposure of API keys, remote code execution).

You should receive a response within 48 hours. We will work with you to understand the issue and coordinate a fix before disclosing it publicly.

## Security Model

Because Plughub generates backend code that runs in user environments, we take security seriously:

- **Secrets:** Generated `.env` files and credentials are ignored by git via `.gitignore`. We expect users to manage their own secrets in production (e.g., using AWS Secrets Manager, Doppler, or Vercel environment variables).
- **Dependencies:** We use Dependabot to automatically monitor and patch vulnerabilities in our dependencies.
- **Isolation:** Providers are designed to run in-process or as isolated microservices. We do not require elevated privileges to run the generated code.
