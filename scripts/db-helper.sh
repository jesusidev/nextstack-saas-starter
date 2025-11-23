#!/bin/bash
# ==============================================================================
# Database Environment Helper Script
# Helps users understand and troubleshoot database connection issues
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[db-helper]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[db-helper]${NC} $1"
}

log_error() {
    echo -e "${RED}[db-helper]${NC} $1"
}

log_note() {
    echo -e "${BLUE}[db-helper]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if Docker Compose services are running
check_compose_services() {
    # Check postgres status
    local postgres_status=$(docker compose ps postgres --format "table {{.State}}" 2>/dev/null | tail -n +2 | head -n 1)
    if ! echo "$postgres_status" | grep -E "(running|Up)" > /dev/null; then
        log_warn "PostgreSQL container is not running. Status: $postgres_status"
        echo ""
        log_note "To start the database:"
        echo "  docker compose up -d postgres"
        echo ""
        return 1
    fi
    
    # Check app status (accept both "running" and "starting" states)
    local app_status=$(docker compose ps app --format "table {{.State}}" 2>/dev/null | tail -n +2 | head -n 1)
    if ! echo "$app_status" | grep -E "(running|Up)" > /dev/null; then
        log_warn "App container is not running properly. Status: $app_status"
        echo ""
        log_note "To start the application:"
        echo "  docker compose up -d"
        echo ""
        return 1
    fi
    
    # If app is still starting, show a note
    if echo "$app_status" | grep -i "starting" > /dev/null; then
        log_info "App container is starting up..."
        return 0
    fi
    
    return 0
}

# Function to validate environment variables
check_env_vars() {
    log_info "Checking environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        log_error "Missing .env.local file"
        log_note "Copy from template: cp .env.local.example .env.local"
        return 1
    fi
    
    # Source the env file
    set -a
    source .env.local
    set +a
    
    # Check DATABASE_URL format
    if [[ "$DATABASE_URL" == *"localhost:5433"* ]]; then
        log_warn "DATABASE_URL is configured for host machine connection"
        log_note "For Docker development, it should use: postgresql://appuser:apppass@postgres:5432/nextstack-saas-starter"
        log_note "Current: $DATABASE_URL"
        return 1
    fi
    
    if [[ "$DATABASE_URL" == *"postgres:5432"* ]]; then
        log_info "DATABASE_URL correctly configured for Docker"
    fi
    
    # Check if required vars are set
    local missing_vars=()
    
    if [ -z "$POSTGRES_USER" ]; then missing_vars+=("POSTGRES_USER"); fi
    if [ -z "$POSTGRES_PASSWORD" ]; then missing_vars+=("POSTGRES_PASSWORD"); fi
    if [ -z "$POSTGRES_DB" ]; then missing_vars+=("POSTGRES_DB"); fi
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        return 1
    fi
    
    return 0
}

# Function to test database connectivity
test_db_connection() {
    log_info "Testing database connectivity..."
    
    if docker compose exec app node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        prisma.\$connect()
            .then(() => { 
                console.log('✅ Database connection successful'); 
                process.exit(0); 
            })
            .catch((err) => { 
                console.error('❌ Database connection failed:', err.message); 
                process.exit(1); 
            });
    " 2>/dev/null; then
        return 0
    else
        log_error "Database connection test failed"
        return 1
    fi
}

# Function to show helpful commands
show_helpful_commands() {
    echo ""
    log_info "Helpful commands for Docker database management:"
    echo ""
    echo "  # Start services"
    echo "  docker compose up -d"
    echo ""
    echo "  # Database operations (from host)"
    echo "  npm run db:docker:push     # Push schema changes"
    echo "  npm run db:docker:migrate  # Run migrations"
    echo "  npm run db:docker:studio   # Open Prisma Studio"
    echo ""
    echo "  # Database operations (inside container)"
    echo "  docker compose exec app npm run db:push"
    echo "  docker compose exec app npm run db:migrate"
    echo ""
    echo "  # View logs"
    echo "  docker compose logs -f postgres"
    echo "  docker compose logs -f app"
    echo ""
    echo "  # Reset database (if needed)"
    echo "  docker compose down -v  # Removes volumes"
    echo "  docker compose up -d    # Recreates with fresh database"
}

# Main execution
main() {
    echo ""
    log_info "Database Environment Helper"
    echo "======================================"
    echo ""
    
    # Check Docker
    check_docker
    log_info "✅ Docker is running"
    
    # Check environment variables
    if check_env_vars; then
        log_info "✅ Environment variables are properly configured"
    else
        log_error "❌ Environment configuration issues found"
        show_helpful_commands
        exit 1
    fi
    
    # Check if services are running
    if check_compose_services; then
        log_info "✅ Docker Compose services are running"
        
        # Test database connection
        if test_db_connection; then
            log_info "✅ Database connection successful"
            echo ""
            log_info "🎉 Everything looks good! Your database is ready."
        else
            log_error "❌ Database connection failed"
            show_helpful_commands
            exit 1
        fi
    else
        log_error "❌ Required services are not running"
        show_helpful_commands
        exit 1
    fi
    
    show_helpful_commands
}

# Run main function
main "$@"