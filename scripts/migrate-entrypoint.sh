#!/bin/sh
# ==============================================================================
# Standalone Migration Runner
# Purpose: Runs Prisma migrations as a separate job
# Exit codes: 0 = success, 1 = failure
# ==============================================================================

set -e

# Color output for better visibility in logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo "${GREEN}[migrate]${NC} $1"
}

log_warn() {
    echo "${YELLOW}[migrate]${NC} $1"
}

log_error() {
    echo "${RED}[migrate]${NC} $1"
}

# Configuration
MAX_DB_WAIT_RETRIES=30
DB_WAIT_RETRY_DELAY=2
MAX_MIGRATION_RETRIES=3
MIGRATION_RETRY_DELAY=5

# Function to wait for database connectivity
wait_for_db() {
    if [ -z "${DATABASE_URL:-}" ]; then
        log_error "DATABASE_URL is not set. Cannot run migrations."
        return 1
    fi

    log_info "Waiting for database connectivity..."
    
    local retries=$MAX_DB_WAIT_RETRIES
    while [ $retries -gt 0 ]; do
        if node -e "
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            prisma.\$connect()
                .then(() => { console.log('DB connected'); process.exit(0); })
                .catch(() => { console.log('DB not ready'); process.exit(1); });
        " 2>/dev/null; then
            log_info "Database is ready"
            return 0
        fi
        
        retries=$((retries - 1))
        log_warn "Database not ready, retrying in ${DB_WAIT_RETRY_DELAY}s... ($retries attempts left)"
        sleep $DB_WAIT_RETRY_DELAY
    done
    
    log_error "Database failed to become ready after $((MAX_DB_WAIT_RETRIES * DB_WAIT_RETRY_DELAY)) seconds"
    return 1
}

# Function to run Prisma migrations with retry logic
run_migrations() {
    local attempt=1
    
    while [ $attempt -le $MAX_MIGRATION_RETRIES ]; do
        log_info "Running Prisma migrations (attempt $attempt/$MAX_MIGRATION_RETRIES)..."
        
        if node_modules/.bin/prisma migrate deploy --schema ./prisma/schema.prisma; then
            log_info "✓ Prisma migrations completed successfully"
            return 0
        else
            log_warn "✗ Migration attempt $attempt failed"
            
            if [ $attempt -lt $MAX_MIGRATION_RETRIES ]; then
                log_info "Retrying in ${MIGRATION_RETRY_DELAY}s..."
                sleep $MIGRATION_RETRY_DELAY
            fi
            
            attempt=$((attempt + 1))
        fi
    done
    
    log_error "✗ Prisma migrations failed after $MAX_MIGRATION_RETRIES attempts"
    return 1
}

# Main execution
main() {
    log_info "=== Prisma Migration Job Started ==="
    
    # Wait for database
    if ! wait_for_db; then
        log_error "Database connectivity check failed. Exiting."
        exit 1
    fi
    
    # Run migrations
    if ! run_migrations; then
        log_error "Migration job failed. Exiting."
        exit 1
    fi
    
    log_info "=== Prisma Migration Job Completed Successfully ==="
    exit 0
}

# Handle signals
trap 'log_info "Received shutdown signal, exiting..."; exit 1' TERM INT

# Run main function
main
