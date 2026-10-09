# Email Capability

Send transactional emails and observe their delivery lifecycle.

## Operations

| Operation        | Type | Purpose                                    |
| ---------------- | ---- | ------------------------------------------ |
| `sendEmail`      | sync | Send a single email                        |
| `getEmailStatus` | sync | Look up the current status of a sent email |

## Events

| Event              | Emitted when                            |
| ------------------ | --------------------------------------- |
| `email.sent`       | Provider accepts the email for delivery |
| `email.delivered`  | Receiving server accepts the email      |
| `email.bounced`    | Receiving server rejects the email      |
| `email.complained` | Recipient marks the email as spam       |

## Guarantees

- A successful `sendEmail` returns within 5 seconds.
- `id` returned by `sendEmail` is stable across `getEmailStatus` calls.
- Event `data.id` matches the `id` returned by `sendEmail`.
- `email.sent` fires exactly once per accepted email.
- Terminal statuses (`delivered`, `bounced`, `complained`, `failed`) never change.

## Providers

See [`providers/`](./providers) for concrete implementations.

## Files

- [`openapi.yaml`](./openapi.yaml) — synchronous HTTP contract
- [`asyncapi.yaml`](./asyncapi.yaml) — event contract
- [`schemas.yaml`](./schemas.yaml) — shared JSON Schemas
