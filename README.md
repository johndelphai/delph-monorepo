# Delph

> Go deeper with AI-powered research and agentic workflows.

Delph is a privacy-focused AI chat platform built for serious research. It supports multiple LLM providers, character-based personas, deep research workflows, and a developer API — all in a clean, minimal interface.

## Features

- **Multi-provider LLM support** — OpenAI, Anthropic, Google, Fireworks, Together AI, xAI, and more
- **Deep Research mode** — multi-step agentic workflows for comprehensive topic analysis
- **Pro Search** — enhanced search with real-time web integration
- **Characters** — custom AI personas with configurable system prompts and model settings
- **Developer API** — first-class API access for programmatic use
- **MCP support** — Model Context Protocol for extensible tool integrations
- **Privacy-first** — chat history stored locally in the browser via IndexedDB (Dexie.js); nothing leaves your device

## Architecture

Monorepo built with Next.js 15, TypeScript, Bun, and Turborepo.

```
├── apps/
│   └── web/              # Next.js web application
│
└── packages/
    ├── ai/               # AI models and provider integrations
    ├── actions/          # Shared server actions and API handlers
    ├── common/           # Shared components, hooks, and utilities
    ├── orchestrator/     # Workflow engine and task management
    ├── prisma/           # Database schema and client
    ├── shared/           # Shared types and constants
    ├── ui/               # Reusable UI component library
    ├── tailwind-config/  # Shared Tailwind configuration
    └── typescript-config/ # Shared TypeScript configuration
```

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Shadcn UI, Framer Motion |
| State | Zustand, React Query |
| Storage | IndexedDB via Dexie.js |
| AI | Vercel AI SDK, multi-provider |
| Database | Drizzle ORM, PostgreSQL |
| Auth | Clerk |
| Tooling | Bun, Turborepo, ESLint, Prettier, Husky |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed

### Installation

```bash
git clone https://github.com/your-org/delph.git
cd delph
bun install
```

### Environment

Copy the example env and fill in your keys:

```bash
cp apps/web/.env.example apps/web/.env.local
```

### Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
bun build
```

## License

MIT — see [LICENSE](LICENSE)
