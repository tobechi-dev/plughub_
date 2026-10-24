import { ArrowRight, Check, Copy } from 'lucide-react'
import { useState } from 'react'

type Provider = 'resend' | 'smtp'

const WAITLIST = 'https://x.com/TAGdev278'

const providers: { id: Provider; label: string; note: string }[] = [
  { id: 'resend', label: 'Resend (HTTP)', note: 'Production' },
  { id: 'smtp', label: 'SMTP', note: 'Local development' },
]

const appLines = [
  "import { email } from '@/backend/email'",
  '',
  'await email.send({',
  "  to: 'dev@plughub.com',",
  "  subject: 'Hello',",
  '})',
]

const indexLines = (p: Provider) =>
  p === 'resend'
    ? [
        { t: "import { resend } from './adapters/resend'", s: 'same' },
        { t: 'export const email = resend', s: 'same' },
      ]
    : [
        { t: "import { resend } from './adapters/resend'", s: 'del' },
        { t: "import { smtp } from './adapters/smtp'", s: 'add' },
        { t: 'export const email = resend', s: 'del' },
        { t: 'export const email = smtp', s: 'add' },
      ]

const tree = {
  before: `my-app/
  ├── src/
  └── package.json`,
  after: `my-app/
  ├── src/
  ├── backend/
  │   └── email/
  │       ├── contract.ts
  │       ├── index.ts
  │       └── adapters/
  │           ├── resend.ts
  │           └── smtp.ts
  ├── docker-compose.dev.yml
  └── package.json`,
}

const principles = [
  {
    h: 'Contract first',
    p: 'Every capability is defined by an OpenAPI contract. Your app depends on the contract, so changing a provider means changing an adapter and nothing else.',
  },
  {
    h: 'Local first',
    p: 'Plughub writes the config to run Mailpit and MinIO on your machine. Build and test email and storage without a cloud account or a bill.',
  },
  {
    h: 'You own the code',
    p: 'The CLI copies plain TypeScript into your ./backend folder. There is no runtime package to depend on, and you can edit every single file.',
  },
]

const registry = [
  { name: 'Email', providers: 'Resend, SMTP (Mailpit)', status: 'In beta' },
  { name: 'Storage', providers: 'AWS S3, Cloudflare R2, MinIO', status: 'In progress' },
  { name: 'Auth', providers: 'To be announced', status: 'Planned' },
]

export default function App() {
  const [provider, setProvider] = useState<Provider>('resend')
  const [copied, setCopied] = useState(false)
  const command = `npx backkit add email --provider ${provider}`

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Grid */}
      <div className="absolute inset-x-0 top-0 h-[800px] bg-editorial-grid pointer-events-none z-0" />

      <header className="border-b border-rule relative z-10 bg-paper/80 backdrop-blur-md sticky top-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <a
            href="#top"
            className="font-display text-xl font-bold tracking-tight flex items-center gap-2"
          >
            <div className="w-6 h-6 bg-ink rounded-md flex items-center justify-center">
              <span className="text-paper text-xs font-mono">P</span>
            </div>
            plughub
          </a>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a
              href="#registry"
              className="hidden text-muted hover:text-ink sm:block transition-colors"
            >
              Registry
            </a>
            <a href="#how" className="hidden text-muted hover:text-ink sm:block transition-colors">
              How it works
            </a>
            <a
              href={WAITLIST}
              className="rounded-full bg-ink px-5 py-2 text-paper transition-all hover:bg-cobalt hover:scale-105"
            >
              Join waitlist
            </a>
          </nav>
        </div>
      </header>

      <main id="top" className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-20 md:px-8 md:pt-28">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rule bg-white mb-6">
            <span className="w-2 h-2 rounded-full bg-cobalt animate-pulse" />
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Private Beta
            </span>
          </div>

          <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Change email providers by editing <span className="text-cobalt">one line.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Plughub is a registry of backend adapters. Run one command and the CLI writes typed
            TypeScript directly into your project. Your app only ever imports the contract.
          </p>

          <div className="mt-12 rounded-2xl border border-rule bg-white shadow-sm overflow-hidden">
            {/* Toggle Bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 border-b border-rule bg-paper/50">
              <span className="text-sm font-medium text-muted mr-2">Select Provider:</span>
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    provider === p.id
                      ? 'border-cobalt bg-cobalt text-white shadow-md shadow-cobalt/20'
                      : 'border-rule bg-white hover:border-ink text-ink'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Code Diff Area */}
            <div className="grid gap-0 md:grid-cols-2">
              {/* Left: App Code */}
              <div className="border-b md:border-b-0 md:border-r border-rule bg-white">
                <div className="flex items-center justify-between border-b border-rule px-4 py-2 bg-code font-mono text-xs">
                  <span className="font-medium">src/app.ts</span>
                  <span className="text-muted flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-600" /> 0 lines changed
                  </span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[13.5px] leading-7 text-ink">
                  {appLines.join('\n')}
                </pre>
              </div>

              {/* Right: Provider Code (Diff) */}
              <div className="bg-white relative">
                <div className="flex items-center justify-between border-b border-rule px-4 py-2 bg-code font-mono text-xs">
                  <span className="font-medium">backend/email/index.ts</span>
                  <span className="text-muted">
                    {provider === 'resend' ? 'Baseline' : '2 lines changed'}
                  </span>
                </div>
                <div className="overflow-x-auto py-5 font-mono text-[13.5px] leading-7 min-h-[196px]">
                  {indexLines(provider).map((l, i) => (
                    <div
                      key={`${provider}-${i}`}
                      className={`whitespace-pre px-5 animate-in fade-in slide-in-from-left-2 duration-300 ${
                        l.s === 'add'
                          ? 'bg-add border-l-2 border-green-500'
                          : l.s === 'del'
                            ? 'bg-del border-l-2 border-red-400 opacity-60'
                            : 'border-l-2 border-transparent'
                      }`}
                    >
                      <span className="inline-block w-4 text-muted select-none">
                        {l.s === 'add' ? '+' : l.s === 'del' ? '-' : ' '}
                      </span>
                      {l.t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Command Bar */}
            <div className="flex items-center justify-between gap-3 bg-ink px-5 py-4 text-paper">
              <code className="overflow-x-auto whitespace-nowrap font-mono text-sm md:text-base flex items-center">
                <span className="text-paper/40 mr-2">$</span>
                {command}
              </code>
              <button
                onClick={copyCommand}
                className="shrink-0 rounded-md p-2 bg-white/10 text-paper transition-colors hover:bg-cobalt hover:text-white"
                aria-label="Copy command"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how" className="border-t border-rule bg-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 md:grid-cols-[1fr_1.2fr] md:px-8">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                What the command adds to your project
              </h2>
              <p className="mt-4 max-w-sm leading-relaxed text-muted">
                Real files, in your repo, that you can read and change. Nothing is hidden inside a
                black-box npm package.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(['before', 'after'] as const).map((k) => (
                <div
                  key={k}
                  className={`rounded-xl border p-5 ${k === 'after' ? 'border-cobalt/30 bg-cobalt/[0.02]' : 'border-rule'}`}
                >
                  <div
                    className={`mb-4 text-xs font-mono uppercase tracking-wider ${k === 'after' ? 'text-cobalt' : 'text-muted'}`}
                  >
                    {k === 'before' ? 'Initial App' : 'After backkit add'}
                  </div>
                  <pre className="overflow-x-auto font-mono text-[13px] leading-6 text-ink">
                    {tree[k]}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="border-t border-rule">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
            {principles.map((x) => (
              <div
                key={x.h}
                className="grid gap-3 border-b border-rule py-10 first:pt-0 last:border-b-0 md:grid-cols-[1fr_1.5fr] md:gap-16"
              >
                <h3 className="font-display text-2xl font-bold tracking-tight">{x.h}</h3>
                <p className="max-w-xl text-lg leading-relaxed text-muted">{x.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Registry */}
        <section id="registry" className="border-t border-rule bg-white">
          <div className="mx-auto max-w-6xl px-5 py-24 md:px-8">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              What is in the registry
            </h2>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink text-muted">
                    <th className="py-4 pr-4 font-medium uppercase tracking-wider text-xs">
                      Capability
                    </th>
                    <th className="py-4 pr-4 font-medium uppercase tracking-wider text-xs">
                      Available Providers
                    </th>
                    <th className="py-4 font-medium uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registry.map((r) => (
                    <tr
                      key={r.name}
                      className="border-b border-rule group hover:bg-paper transition-colors"
                    >
                      <td className="py-5 pr-4 font-display text-xl font-bold">{r.name}</td>
                      <td className="py-5 pr-4 text-muted">{r.providers}</td>
                      <td className="py-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            r.status === 'In beta'
                              ? 'bg-cobalt/10 text-cobalt border-cobalt/20'
                              : r.status === 'In progress'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink text-paper relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
          <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32 relative z-10">
            <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Stop rewriting infrastructure.
            </h2>
            <p className="mt-6 max-w-md text-lg text-paper/70">
              Plughub is currently in private beta. Join the waitlist and we will send an invite as
              spots open.
            </p>
            <a
              href={WAITLIST}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-cobalt px-8 py-4 font-semibold text-white transition-all hover:bg-white hover:text-ink hover:scale-105"
            >
              Join the waitlist <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 Tobechukwu Ejiofor. Released under the Apache 2.0 license.</p>
          <div className="flex gap-6 font-medium">
            <a href="https://github.com/tobechi-dev" className="hover:text-ink transition-colors">
              GitHub
            </a>
            <a href={WAITLIST} className="hover:text-ink transition-colors">
              X (Twitter)
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
