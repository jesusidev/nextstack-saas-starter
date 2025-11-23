# NextStack SaaS Starter

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11.4-2596BE.svg)](https://trpc.io/)
[![Mantine](https://img.shields.io/badge/Mantine-8.3-339AF0.svg)](https://mantine.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

> **A Next.js SaaS starter template showcasing modern full-stack development with authentication, database, S3 uploads, and full-stack type safety.**  
> Perfect for learning, experimentation, and rapid prototyping. 🚀

> **⚠️ Note:** This is a template/testing playground for exploring modern web development tools and patterns. It is not actively maintained for production use. Feel free to fork, modify, and adapt it for your own projects!

---

## ✨ What's Included

### Core Features
- 🔒 **Authentication** — Clerk integration with user management
- 💾 **Database** — PostgreSQL with Prisma ORM
- 📸 **File Uploads** — Direct-to-S3 with presigned URLs
- 🎨 **UI Components** — Mantine library with dark mode
- 📊 **Analytics** — Google Analytics 4 + Microsoft Clarity
- 🍪 **Cookie Consent** — Customizable cookie preferences with GDPR compliance
- 🔐 **Authorization** — Ownership-based access control
- 🧪 **Testing** — Jest (unit) + Playwright (E2E)

### Developer Experience
- ⚡ **Type Safety** — End-to-end TypeScript + tRPC
- 🐳 **Docker First** — Production parity from day one
- 🔄 **Hot Reload** — Fast development iteration
- 📝 **Code Quality** — Biome linting + formatting
- 🎯 **Git Hooks** — Automated validation with Husky
- 📦 **Optimistic UI** — Instant feedback with automatic rollback

### Production Ready
- 🏗️ **Infrastructure as Code** — Terraform modules included
- 🚀 **CI/CD** — GitHub Actions workflows
- 🔒 **Security** — Best practices built-in
- 📈 **Scalable** — Stateless architecture
- 🌍 **Multi-Environment** — Dev, QA, Production configs

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Node.js 18+** (if not using Docker)
- **AWS Account** (for S3 features)
- **Clerk Account** (for authentication)

### 1. Clone and Install

```bash
git clone <your-repository-url>
cd nextstack-saas-starter
npm install
```

### 2. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your credentials:
# - Clerk API keys (from https://dashboard.clerk.com)
# - AWS credentials (from AWS IAM)
# - S3 bucket name
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

### 3. Start Development

**With Docker (Recommended):**

```bash
docker compose up -d
```

Access at http://localhost:3001

**Without Docker:**

```bash
# Start PostgreSQL separately
docker compose up -d postgres

# Run migrations
npm run db:migrate

# Start dev server
npm run dev
```

Access at http://localhost:3000

---

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** — Complete setup and customization guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System architecture and design decisions
- **[docs/](./docs/)** — Detailed technical documentation
  - [API Documentation](./docs/api/)
  - [Development Guides](./docs/development/)
  - [Architecture Decisions](./docs/architecture/)

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** — React framework with App Router
- **React 18** — UI library with Server Components
- **TypeScript** — Type safety
- **Mantine 8** — Component library
- **tRPC** — Type-safe API client

### Backend
- **Next.js API Routes** — Serverless functions
- **tRPC** — Type-safe API layer
- **Prisma** — ORM and database toolkit
- **PostgreSQL 15** — Relational database
- **Zod** — Runtime validation

### Authentication & Storage
- **Clerk** — User authentication
- **AWS S3** — File storage
- **Presigned URLs** — Secure uploads

### DevOps
- **Docker** — Containerization
- **Terraform** — Infrastructure as Code
- **GitHub Actions** — CI/CD
- **Biome** — Linting and formatting

### Testing
- **Jest** — Unit testing
- **Playwright** — E2E testing
- **React Testing Library** — Component testing

---

## 📦 Project Structure

```
nextstack-saas-starter/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── server/           # tRPC routers and server code
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── styles/           # CSS modules
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── e2e/                  # Playwright E2E tests
├── ops/                  # Terraform infrastructure
│   ├── modules/          # Reusable Terraform modules
│   ├── apps/             # Application infrastructure
│   └── global/           # Global infrastructure
├── docs/                 # Documentation
├── scripts/              # Utility scripts
└── .github/              # GitHub Actions workflows
```

---

## 🔧 Available Scripts

### Development

```bash
npm run dev              # Start development server
npm run dev:only         # Start without format watcher
npm run build            # Build for production
npm run start            # Start production server
```

### Database

```bash
npm run db:push          # Push schema changes
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:check         # Verify database connection
```

### Docker Database Commands

```bash
npm run db:docker:push      # Push schema (Docker)
npm run db:docker:migrate   # Run migrations (Docker)
npm run db:docker:studio    # Open Prisma Studio (Docker)
```

### Testing

```bash
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
```

### Code Quality

```bash
npm run lint             # Lint code
npm run lint:fix         # Lint and fix
npm run format           # Check formatting
npm run format:fix       # Format code
npm run check            # Lint + format check
npm run check:fix        # Lint + format fix
npm run type-check       # TypeScript check
```

---

## 🎯 Getting Started

### 1. Customize the Template

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for step-by-step instructions on:
- Renaming the project
- Setting up environment variables
- Configuring authentication
- Setting up AWS S3
- Deploying to production

### 2. Understand the Architecture

Read [ARCHITECTURE.md](./ARCHITECTURE.md) to learn about:
- System design and patterns
- Technology choices and rationale
- Data flow and security
- Performance optimizations

### 3. Start Building

The template includes example features you can:
- **Keep** — Use as-is or customize
- **Remove** — Delete what you don't need
- **Extend** — Add your own features

Example features included:
- User dashboard
- Product management (CRUD)
- Project organization
- File uploads to S3
- Public product browsing
- Search and filtering
- Analytics tracking
- Cookie consent management (GDPR-compliant)

---

## 🔐 Security & Privacy Features

- ✅ **Authentication** — Clerk with JWT tokens
- ✅ **Authorization** — Ownership-based access control
- ✅ **Cookie Consent** — GDPR-compliant cookie management
- ✅ **SQL Injection Protection** — Prisma parameterized queries
- ✅ **XSS Protection** — React automatic escaping
- ✅ **CSRF Protection** — SameSite cookies
- ✅ **Rate Limiting** — API route protection
- ✅ **Environment Variables** — Secrets management
- ✅ **Docker Security** — Non-root user
- ✅ **HTTPS Only** — Production enforcement

---

## 🚀 Deployment

### Vercel (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/nextstack-saas-starter)

1. Click the button above
2. Add environment variables
3. Deploy!

### Railway

1. Push to GitHub
2. Import to Railway
3. Add PostgreSQL database
4. Add environment variables
5. Deploy!

### Docker (Self-Hosted)

```bash
# Build production image
docker build -f Dockerfile.app --target production -t nextstack:latest .

# Run with docker-compose
docker compose -f docker-compose.production.yml up -d
```

### AWS (Advanced)

Use the included Terraform modules:

```bash
cd ops/apps/app-template/dev
# Follow deployment guides in each module
```

---

## 📚 Learn More

### Documentation
- [Setup Guide](./SETUP_GUIDE.md) — Complete setup instructions
- [Architecture](./ARCHITECTURE.md) — System design and patterns
- [API Docs](./docs/api/) — API endpoint documentation
- [Development Guides](./docs/development/) — Development patterns

### Technologies
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Mantine Documentation](https://mantine.dev)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open-source tools:
- [Next.js](https://nextjs.org/) by Vercel
- [tRPC](https://trpc.io/) by the tRPC team
- [Prisma](https://www.prisma.io/) by Prisma
- [Clerk](https://clerk.com/) by Clerk
- [Mantine](https://mantine.dev/) by Mantine
- And many more!

---

## 💬 Support

- 📖 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/your-username/nextstack-saas-starter/issues)
- 💡 [Request Features](https://github.com/your-username/nextstack-saas-starter/issues/new)
- 💬 [Discussions](https://github.com/your-username/nextstack-saas-starter/discussions)

---

**Ready to build your SaaS?** Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) to get started! 🚀
