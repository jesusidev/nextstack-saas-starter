# Debug Scripts

This directory contains useful debugging scripts for the application.

## Usage

All scripts should be run from the project root with the appropriate DATABASE_URL:

```bash
DATABASE_URL="postgresql://appuser:apppass@localhost:5433/appdb" node scripts/debug/[script-name].mjs
```

## Available Scripts

### `check-users.mjs`
- **Purpose**: Lists all users in the database
- **Output**: User ID, name, email, and role for each user
- **Safe**: Read-only operation

### `check-products.mjs` 
- **Purpose**: Lists all products in the database
- **Output**: Product details including owner information and image counts
- **Safe**: Read-only operation

### `clear-database.mjs`
- **Purpose**: Deletes ALL data from the database
- **⚠️ WARNING**: Destructive operation! Use with caution
- **Use case**: Resetting database for testing UserVerification modal

## Examples

```bash
# Check if any users exist (useful for testing UserVerification)
DATABASE_URL="postgresql://appuser:apppass@localhost:5433/appdb" node scripts/debug/check-users.mjs

# See all products in the system
DATABASE_URL="postgresql://appuser:apppass@localhost:5433/appdb" node scripts/debug/check-products.mjs

# Clear everything to test fresh user onboarding
DATABASE_URL="postgresql://appuser:apppass@localhost:5433/appdb" node scripts/debug/clear-database.mjs
```

## Notes

- These scripts connect directly to the database using Prisma
- Make sure Docker containers are running before using these scripts
- Use `localhost:5433` for local development (not `postgres:5433` which is for Docker internal networking)