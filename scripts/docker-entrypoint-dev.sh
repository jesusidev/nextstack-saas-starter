#!/bin/sh
# ==============================================================================
# Development Docker Entrypoint
# Handles permission issues with volume mounts in development
# ==============================================================================

set -e

# Ensure .next directory exists and has proper permissions
if [ ! -d "/app/.next" ]; then
    mkdir -p /app/.next
fi
chmod -R 755 /app/.next 2>/dev/null || true

# Ensure node_modules permissions are correct
if [ -d "/app/node_modules" ]; then
    chmod -R 755 /app/node_modules 2>/dev/null || true
fi

# Make sure we can write to the app directory
chmod 755 /app 2>/dev/null || true

echo "[dev-entrypoint] Development environment setup complete"
echo "[dev-entrypoint] Starting: $@"

# Execute the main command
exec "$@"