# Versioning and Releases

This project uses **Semantic Versioning** with automated releases via **semantic-release**.

## How It Works

### Automatic Versioning

When you push to `main`, semantic-release analyzes your commit messages and automatically:

1. **Determines version bump** based on commit types
2. **Creates git tag** (e.g., `v1.2.3`)
3. **Generates CHANGELOG.md**
4. **Creates GitHub release**
5. **Triggers Docker build** with version tag

### No Manual Version Management

❌ **Don't do this:**
```bash
# Manually updating version in package.json
npm version patch
git tag v1.0.1
```

✅ **Do this instead:**
```bash
# Just commit with conventional format
git commit -m "feat: add new feature"
git push origin main

# semantic-release handles everything automatically!
```

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types and Version Bumps

| Commit Type | Version Bump | Example | Result |
|------------|--------------|---------|--------|
| `feat:` | **Minor** (0.x.0) | `feat: add user dashboard` | v1.0.0 → v1.1.0 |
| `fix:` | **Patch** (0.0.x) | `fix: resolve login bug` | v1.0.0 → v1.0.1 |
| `perf:` | **Patch** (0.0.x) | `perf: optimize database queries` | v1.0.0 → v1.0.1 |
| `feat!:` | **Major** (x.0.0) | `feat!: redesign API` | v1.0.0 → v2.0.0 |
| `BREAKING CHANGE:` | **Major** (x.0.0) | See below | v1.0.0 → v2.0.0 |
| `docs:` | **Patch** (0.0.x) | `docs: update README` | v1.0.0 → v1.0.1 |
| `refactor:` | **Patch** (0.0.x) | `refactor: simplify auth logic` | v1.0.0 → v1.0.1 |
| `build:` | **Patch** (0.0.x) | `build: update dependencies` | v1.0.0 → v1.0.1 |
| `chore:` | **No release** | `chore: update .gitignore` | No version bump |
| `ci:` | **No release** | `ci: fix workflow` | No version bump |
| `test:` | **No release** | `test: add unit tests` | No version bump |
| `style:` | **No release** | `style: format code` | No version bump |

### Examples

#### Feature (Minor Version Bump)
```bash
git commit -m "feat: add dark mode toggle"
# Result: v1.0.0 → v1.1.0
```

#### Bug Fix (Patch Version Bump)
```bash
git commit -m "fix: resolve memory leak in image upload"
# Result: v1.0.0 → v1.0.1
```

#### Breaking Change (Major Version Bump)
```bash
# Option 1: Using ! suffix
git commit -m "feat!: redesign authentication API"

# Option 2: Using footer
git commit -m "feat: redesign authentication API

BREAKING CHANGE: The /api/auth endpoint now requires OAuth2 tokens instead of API keys."

# Result: v1.0.0 → v2.0.0
```

#### With Scope
```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(dashboard): correct chart rendering"
git commit -m "perf(api): optimize database queries"
```

#### Multiple Changes
```bash
git commit -m "feat: add user profile page

- Add profile editing form
- Add avatar upload
- Add password change functionality

Closes #123"
```

#### No Release
```bash
git commit -m "chore: update dependencies"
git commit -m "ci: fix deployment workflow"
git commit -m "test: add integration tests"
# Result: No version bump, no release
```

## Workflow

### 1. Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Merge to Main

```bash
# Merge PR to main (via GitHub UI or CLI)
gh pr merge --squash
```

### 3. Automatic Release

When merged to `main`, the **Release workflow** automatically:

```
┌─────────────────────────────────────────────────────────┐
│ 1. Analyze Commits                                      │
│    - Reads commits since last release                   │
│    - Determines version bump                            │
├─────────────────────────────────────────────────────────┤
│ 2. Create Release                                       │
│    - Bumps version in package.json                      │
│    - Generates CHANGELOG.md                             │
│    - Creates git tag (v1.2.3)                           │
│    - Creates GitHub release                             │
├─────────────────────────────────────────────────────────┤
│ 3. Trigger Deployment                                   │
│    - Production deployment workflow starts              │
│    - Builds Docker image with version tag               │
│    - Pushes to ECR: v1.2.3, latest, sha                 │
│    - Deploys to Dokploy                                 │
└─────────────────────────────────────────────────────────┘
```

### 4. Docker Images

After release, Docker images are tagged with:

```
123456789012.dkr.ecr.us-west-2.amazonaws.com/nextstack-saas-starter-dev:v1.2.3    ← Version tag
123456789012.dkr.ecr.us-west-2.amazonaws.com/nextstack-saas-starter-dev:latest    ← Latest tag
123456789012.dkr.ecr.us-west-2.amazonaws.com/nextstack-saas-starter-dev:abc123    ← Commit SHA
```

## Viewing Releases

### GitHub Releases Page
```
https://github.com/your-username/NextStack SaaS Starter/releases
```

### Latest Release
```bash
gh release view --web
```

### All Releases
```bash
gh release list
```

### Changelog
```bash
cat CHANGELOG.md
```

## Manual Deployment

If you need to deploy a specific version manually:

### Via GitHub Actions UI

1. Go to **Actions** → **Production Deployment**
2. Click **Run workflow**
3. Enter version tag (e.g., `v1.2.3`)
4. Click **Run workflow**

### Via GitHub CLI

```bash
# Deploy specific version
gh workflow run deploy-production.yml -f version=v1.2.3

# Deploy latest
gh workflow run deploy-production.yml -f version=latest
```

## Rollback to Previous Version

### Option 1: Via GitHub Actions

```bash
# Find previous version
gh release list

# Deploy previous version
gh workflow run deploy-production.yml -f version=v1.1.0
```

### Option 2: Via Dokploy

1. Go to Dokploy dashboard
2. Select application
3. Go to **Deployments** tab
4. Click on previous deployment
5. Click **Redeploy**

## Troubleshooting

### No Release Created

**Problem:** Pushed to main but no release was created

**Cause:** No releasable commits since last release

**Solution:** Check commit messages follow conventional format

```bash
# View recent commits
git log --oneline -10

# Check if commits have proper types
# ✅ feat: add feature
# ✅ fix: bug fix
# ❌ added new feature (missing type)
# ❌ updated code (missing type)
```

### Wrong Version Bump

**Problem:** Expected minor bump but got patch

**Cause:** Used wrong commit type

**Solution:** Use correct commit type

```bash
# For new features, use feat:
git commit -m "feat: add feature"  # ✅ Minor bump

# Not:
git commit -m "fix: add feature"   # ❌ Patch bump
```

### Release Failed

**Problem:** Release workflow failed

**Cause:** Check GitHub Actions logs

**Solution:**

```bash
# View workflow runs
gh run list --workflow=release.yml

# View specific run
gh run view <run-id>

# Common issues:
# - GITHUB_TOKEN permissions
# - Merge conflicts in CHANGELOG.md
# - Invalid commit messages
```

## Best Practices

### ✅ Do

- Use conventional commit format
- Write clear, descriptive commit messages
- Include issue numbers in commits (`Closes #123`)
- Squash commits when merging PRs
- Review CHANGELOG.md after releases

### ❌ Don't

- Manually edit version in package.json
- Create git tags manually
- Skip commit message format
- Use generic messages like "update" or "fix"
- Commit directly to main (use PRs)

## Configuration

### Semantic Release Config

Configuration is in `.releaserc.json`:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/git"
  ]
}
```

### Customizing Release Rules

To change version bump rules, edit `.releaserc.json`:

```json
{
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {
        "releaseRules": [
          { "type": "docs", "release": "patch" },
          { "type": "refactor", "release": "patch" },
          { "type": "style", "release": false }
        ]
      }
    ]
  ]
}
```

## Examples from Real Projects

### Adding a Feature

```bash
git commit -m "feat(dashboard): add analytics charts

- Add line chart for user growth
- Add pie chart for revenue breakdown
- Add date range selector

Closes #45"

# Result: v1.0.0 → v1.1.0
```

### Fixing a Bug

```bash
git commit -m "fix(auth): resolve session timeout issue

Users were being logged out after 5 minutes instead of 30 minutes.
Updated session configuration to use correct timeout value.

Fixes #67"

# Result: v1.1.0 → v1.1.1
```

### Breaking Change

```bash
git commit -m "feat(api): migrate to GraphQL

BREAKING CHANGE: REST API endpoints have been removed.
All clients must migrate to GraphQL API.

Migration guide: docs/graphql-migration.md

Closes #89"

# Result: v1.1.1 → v2.0.0
```

### Performance Improvement

```bash
git commit -m "perf(database): add indexes to user queries

Added composite index on (user_id, created_at) to improve
dashboard load time by 80%.

Closes #102"

# Result: v2.0.0 → v2.0.1
```

## Related Documentation

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [semantic-release](https://semantic-release.gitbook.io/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

## Support

**Questions?**
- Check [CHANGELOG.md](../CHANGELOG.md) for release history
- View [GitHub Releases](https://github.com/your-username/NextStack SaaS Starter/releases)
- Review [GitHub Actions](https://github.com/your-username/NextStack SaaS Starter/actions)
