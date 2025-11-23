# Git Workflow & Naming Conventions

This document outlines the Git workflow, branch naming conventions, and PR guidelines for NextStack SaaS Starter.

## Branch Naming Convention

All branches must follow the pattern: `<type>/<description>`

### Branch Types

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New features or enhancements | `feature/user-authentication` |
| `fix/` | Bug fixes | `fix/memory-leak-in-uploads` |
| `hotfix/` | Urgent production fixes | `hotfix/critical-security-patch` |
| `refactor/` | Code refactoring | `refactor/simplify-auth-logic` |
| `docs/` | Documentation updates | `docs/update-api-documentation` |
| `test/` | Test additions or updates | `test/add-integration-tests` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `perf/` | Performance improvements | `perf/optimize-database-queries` |
| `ci/` | CI/CD changes | `ci/add-deployment-workflow` |
| `build/` | Build system changes | `build/update-docker-config` |

### Branch Naming Rules

✅ **Do:**
- Use lowercase letters
- Use hyphens to separate words
- Be descriptive but concise
- Include issue number if applicable

```bash
✅ feature/user-authentication
✅ fix/login-redirect-bug
✅ hotfix/security-vulnerability-123
✅ refactor/auth-service
✅ docs/api-documentation
```

❌ **Don't:**
- Use uppercase letters
- Use underscores
- Use spaces
- Be too vague

```bash
❌ Feature/UserAuth (uppercase)
❌ feature_user_auth (underscores)
❌ feature/user auth (spaces)
❌ my-branch (no type)
❌ feature/update (too vague)
```

## Pull Request Title Convention

PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/) format:

### Format

```
<type>(<scope>): <description>
```

- **type**: Same as branch types (feat, fix, etc.)
- **scope** (optional): Area of codebase (auth, api, ui, etc.)
- **description**: Brief summary in lowercase

### PR Title Examples

```
✅ feat: add user authentication
✅ fix: resolve memory leak in image uploads
✅ feat(auth): add two-factor authentication
✅ fix(api): correct validation error messages
✅ perf(database): optimize user queries
✅ docs: update deployment guide
✅ refactor(ui): simplify dashboard components
✅ chore: update dependencies to latest versions

❌ Add user authentication (missing type)
❌ Feat: add feature (uppercase type)
❌ feature: Add Feature (uppercase description)
❌ Updated code (no type, vague)
```

### PR Title Types

| Type | When to Use | Version Impact |
|------|-------------|----------------|
| `feat:` | New feature | Minor (v1.1.0) |
| `fix:` | Bug fix | Patch (v1.0.1) |
| `perf:` | Performance improvement | Patch (v1.0.1) |
| `docs:` | Documentation only | Patch (v1.0.1) |
| `refactor:` | Code refactoring | Patch (v1.0.1) |
| `test:` | Adding tests | No release |
| `chore:` | Maintenance | No release |
| `ci:` | CI/CD changes | No release |
| `build:` | Build system | Patch (v1.0.1) |
| `feat!:` | Breaking change | Major (v2.0.0) |

## Workflow

### 1. Create Feature Branch

```bash
# Create and checkout new branch
git checkout -b feature/user-dashboard

# Or for bug fixes
git checkout -b fix/login-redirect-bug
```

### 2. Make Changes and Commit

Use conventional commit messages:

```bash
# Add changes
git add .

# Commit with conventional format
git commit -m "feat: add user dashboard with analytics"

# Or with scope
git commit -m "feat(dashboard): add analytics charts"

# Multiple commits are fine
git commit -m "feat: add dashboard layout"
git commit -m "feat: add analytics API endpoint"
git commit -m "test: add dashboard tests"
```

### 3. Push Branch

```bash
# First push
git push -u origin feature/user-dashboard

# Subsequent pushes
git push
```

### 4. Create Pull Request

```bash
# Using GitHub CLI
gh pr create --title "feat: add user dashboard with analytics" --body "
## Summary
- Add user dashboard page
- Add analytics charts
- Add data fetching hooks

## Testing
- ✅ Unit tests added
- ✅ E2E tests added
- ✅ Manual testing completed

Closes #123
"

# Or use GitHub UI
# The PR title MUST follow conventional commits format
```

### 5. PR Review and Merge

```bash
# After approval, squash merge to main
gh pr merge --squash

# This creates a single commit on main with your PR title as the message
# semantic-release will analyze this commit for versioning
```

### 6. Automatic Release

After merge to `main`:
1. Release workflow analyzes commit
2. Determines version bump
3. Creates release (e.g., v1.1.0)
4. Triggers production deployment

## Validation

### Automated Checks

When you create a PR, GitHub Actions automatically validates:

✅ **PR Title** - Must follow conventional commits format
✅ **Branch Name** - Must follow `<type>/<description>` pattern

If validation fails:
- ❌ PR check fails
- 💬 Bot comments with instructions
- 🔧 Fix branch name or PR title
- ✅ Validation re-runs automatically

### Manual Validation

Before creating PR, check your branch name:

```bash
# Get current branch
git branch --show-current

# Should match pattern: <type>/<description>
# ✅ feature/user-dashboard
# ❌ user-dashboard
```

## Common Scenarios

### Scenario 1: New Feature

```bash
# 1. Create branch
git checkout -b feature/dark-mode

# 2. Implement feature
# ... make changes ...

# 3. Commit
git add .
git commit -m "feat: add dark mode toggle"

# 4. Push
git push -u origin feature/dark-mode

# 5. Create PR
gh pr create --title "feat: add dark mode toggle"

# 6. Merge
gh pr merge --squash

# Result: v1.0.0 → v1.1.0 (minor bump)
```

### Scenario 2: Bug Fix

```bash
# 1. Create branch
git checkout -b fix/login-redirect

# 2. Fix bug
# ... make changes ...

# 3. Commit
git add .
git commit -m "fix: resolve login redirect issue"

# 4. Push and create PR
git push -u origin fix/login-redirect
gh pr create --title "fix: resolve login redirect issue"

# 5. Merge
gh pr merge --squash

# Result: v1.1.0 → v1.1.1 (patch bump)
```

### Scenario 3: Hotfix (Production)

```bash
# 1. Create branch from main
git checkout main
git pull
git checkout -b hotfix/security-vulnerability

# 2. Fix issue
# ... make changes ...

# 3. Commit
git add .
git commit -m "fix: patch security vulnerability in auth"

# 4. Push and create PR
git push -u origin hotfix/security-vulnerability
gh pr create --title "fix: patch security vulnerability in auth" --label "priority:high"

# 5. Fast-track review and merge
gh pr merge --squash

# Result: Immediate release and deployment
```

### Scenario 4: Breaking Change

```bash
# 1. Create branch
git checkout -b feature/api-redesign

# 2. Implement changes
# ... make changes ...

# 3. Commit with breaking change indicator
git add .
git commit -m "feat!: redesign authentication API

BREAKING CHANGE: The /api/auth endpoint now requires OAuth2 tokens.
API keys are no longer supported. See migration guide in docs/auth-migration.md"

# 4. Push and create PR
git push -u origin feature/api-redesign
gh pr create --title "feat!: redesign authentication API"

# 5. Merge
gh pr merge --squash

# Result: v1.1.1 → v2.0.0 (major bump)
```

### Scenario 5: Multiple Related Changes

```bash
# 1. Create branch
git checkout -b feature/user-profile

# 2. Make multiple commits
git commit -m "feat: add profile page layout"
git commit -m "feat: add avatar upload"
git commit -m "feat: add profile editing form"
git commit -m "test: add profile tests"

# 3. Push and create PR
git push -u origin feature/user-profile
gh pr create --title "feat: add user profile page"

# 4. Squash merge (combines all commits)
gh pr merge --squash

# Result: Single commit on main with PR title
# Version: v1.1.0 → v1.2.0 (minor bump)
```

## Renaming Branches

If you created a branch with the wrong name:

```bash
# Rename local branch
git branch -m old-branch-name feature/new-name

# Delete old remote branch
git push origin --delete old-branch-name

# Push new branch
git push -u origin feature/new-name

# Update PR (if already created)
# GitHub will automatically update the PR to track the new branch
```

## Protected Branches

### Main Branch Protection

The `main` branch has these protections:

- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ❌ No direct pushes allowed

### Required Status Checks

Before merging to `main`, these checks must pass:

- ✅ PR title validation
- ✅ Branch name validation
- ✅ Build successful
- ✅ Tests passing
- ✅ Linting passing

## Commit Message Best Practices

### Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Subject Line

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Limit to 72 characters

```bash
✅ feat: add user authentication
✅ fix: resolve memory leak
✅ perf: optimize database queries

❌ feat: Added user authentication (past tense)
❌ feat: Add user authentication (capitalized)
❌ feat: add user authentication. (period)
```

### Body (Optional)

Explain what and why, not how:

```bash
git commit -m "feat: add user dashboard

Add a new dashboard page that displays user analytics,
recent activity, and quick actions. This improves user
engagement by providing at-a-glance information.

The dashboard uses server-side rendering for better
performance and SEO."
```

### Footer (Optional)

Reference issues and breaking changes:

```bash
git commit -m "feat: add user dashboard

Closes #123
Refs #124, #125"

# Or for breaking changes
git commit -m "feat: redesign API

BREAKING CHANGE: The /api/v1 endpoints have been removed.
All clients must migrate to /api/v2."
```

## Troubleshooting

### PR Validation Failed

**Error:** "PR title doesn't follow conventional commits"

**Solution:**
1. Click "Edit" on your PR
2. Update title to: `<type>: <description>`
3. Save changes
4. Validation re-runs automatically

**Error:** "Branch name doesn't follow naming convention"

**Solution:**
```bash
# Rename branch
git branch -m feature/correct-name

# Update remote
git push origin -u feature/correct-name
git push origin --delete old-branch-name
```

### Merge Conflicts

```bash
# Update your branch with latest main
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# Resolve conflicts
# ... edit files ...
git add .
git rebase --continue

# Force push (rebase rewrites history)
git push --force-with-lease
```

### Accidentally Committed to Main

```bash
# Create branch from current state
git branch feature/my-changes

# Reset main to remote
git checkout main
git reset --hard origin/main

# Switch to feature branch
git checkout feature/my-changes

# Push and create PR
git push -u origin feature/my-changes
gh pr create
```

## Quick Reference

### Create Feature Branch
```bash
git checkout -b feature/description
```

### Commit Changes
```bash
git add .
git commit -m "feat: description"
```

### Push Branch
```bash
git push -u origin feature/description
```

### Create PR
```bash
gh pr create --title "feat: description"
```

### Merge PR
```bash
gh pr merge --squash
```

### View Releases
```bash
gh release list
```

### Deploy Specific Version
```bash
gh workflow run deploy-production.yml -f version=v1.2.3
```

## Configuration Files

### Branch Protection
- Configured in: GitHub Repository Settings → Branches

### PR Validation
- Workflow: `.github/workflows/pr-validation.yml`
- Validates: PR title and branch name

### Semantic Release
- Config: `.releaserc.json`
- Workflow: `.github/workflows/release.yml`

## Team Guidelines

### Before Creating PR

- [ ] Branch name follows convention
- [ ] Commits use conventional format
- [ ] PR title follows conventional format
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No merge conflicts

### During Review

- [ ] Address review comments
- [ ] Keep PR focused (one feature/fix)
- [ ] Squash fixup commits if needed
- [ ] Ensure CI checks pass

### After Merge

- [ ] Delete feature branch
- [ ] Verify release created (if applicable)
- [ ] Monitor deployment
- [ ] Update related issues

## Examples

### Good PR Workflow

```bash
# 1. Create branch
git checkout -b feature/add-search

# 2. Implement feature
# ... code ...

# 3. Commit with conventional format
git commit -m "feat: add global search functionality"
git commit -m "test: add search tests"
git commit -m "docs: update search documentation"

# 4. Push
git push -u origin feature/add-search

# 5. Create PR with conventional title
gh pr create \
  --title "feat: add global search functionality" \
  --body "Adds global search across products and projects. Closes #45"

# 6. After approval, squash merge
gh pr merge --squash

# 7. Automatic release
# → semantic-release creates v1.2.0
# → Production deployment triggered
# → Docker image: nextstack-saas-starter-dev:v1.2.0
```

### Bad PR Workflow (Don't Do This)

```bash
# ❌ Wrong branch name
git checkout -b my-feature

# ❌ Non-conventional commits
git commit -m "updated code"
git commit -m "fixed stuff"

# ❌ Wrong PR title
gh pr create --title "Updated the application"

# Result: PR validation fails, no automatic release
```

## Related Documentation

- [Versioning and Releases](./versioning-and-releases.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)

## Support

**Questions about workflow?**
- Review this guide
- Check [versioning-and-releases.md](./versioning-and-releases.md)
- Ask in team chat

**Validation failing?**
- Check error message in PR
- Review naming conventions above
- Update branch name or PR title
