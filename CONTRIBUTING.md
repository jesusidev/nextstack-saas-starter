# Contributing to NextStack SaaS Starter

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## Code of Conduct

Please be respectful and constructive in all interactions. We're building a welcoming community.

---

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/nextstack/nextstack-saas-starter/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check [Discussions](https://github.com/nextstack/nextstack-saas-starter/discussions) for similar ideas
2. Create a new discussion or issue with:
   - Clear use case
   - Proposed solution
   - Alternative approaches considered
   - Willingness to implement

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes:**
   - Follow existing code style
   - Add tests for new features
   - Update documentation
4. **Test your changes:**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run test:e2e
   ```
5. **Commit with conventional commits:**
   ```bash
   git commit -m "feat: add new feature"
   ```
6. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Development Setup

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete setup instructions.

Quick start:
```bash
git clone <your-fork>
cd nextstack-saas-starter
npm install
cp .env.example .env
# Fill in .env with your credentials
docker compose up -d
```

---

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Avoid `any` types
- Use strict mode
- Add JSDoc comments for public APIs

### Code Style
- Use Biome for formatting (runs automatically)
- Follow existing patterns
- Keep functions small and focused
- Use meaningful variable names

### Commits
- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Testing
- Add unit tests for utilities and hooks
- Add E2E tests for user flows
- Maintain test coverage
- Tests should be fast and reliable

---

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update CHANGELOG** (if applicable)
5. **Request review** from maintainers
6. **Address feedback** promptly
7. **Squash commits** if requested

---

## Questions?

- 💬 [Start a Discussion](https://github.com/nextstack/nextstack-saas-starter/discussions)

---

Thank you for contributing! 🙏
