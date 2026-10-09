# SMTP Provider

Send emails through any SMTP server. Implements the [email capability](../../README.md).

## Configuration

| Variable        | Required | Description                          |
| --------------- | -------- | ------------------------------------ |
| `SMTP_HOST`     | yes      | SMTP server hostname                 |
| `SMTP_PORT`     | yes      | SMTP server port                     |
| `SMTP_USER`     | yes      | SMTP username                        |
| `SMTP_PASSWORD` | yes      | SMTP password                        |
| `SMTP_SECURE`   | no       | Use TLS on connect (default `false`) |
| `PORT`          | no       | HTTP port (default `8787`)           |

## Local development

Start a fake SMTP server:

```bash
docker compose up -d
```
