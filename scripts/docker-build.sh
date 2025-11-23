#!/bin/bash
# ==============================================================================
# Optimized Build Script for Docker Deployments
# Features:
# - Multi-stage build optimization
# - Build caching strategies
# - Environment-specific builds
# - Performance monitoring
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOCKERFILE="Dockerfile.app"
IMAGE_NAME="${IMAGE_NAME:-nextstack-saas-starter/app}"
BUILD_TARGET="${BUILD_TARGET:-production}"
REGISTRY="${REGISTRY:-}"
PUSH_IMAGE="${PUSH_IMAGE:-false}"
BUILD_CACHE="${BUILD_CACHE:-true}"

# Helper functions
log_info() {
    echo -e "${GREEN}[build]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[build]${NC} $1"
}

log_error() {
    echo -e "${RED}[build]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[build]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --target TARGET     Build target (development, production, qa, staging)"
    echo "  -i, --image IMAGE       Image name (default: nextstack-saas-starter/app)"
    echo "  -r, --registry URL      Registry URL for pushing"
    echo "  -p, --push              Push image after building"
    echo "  --no-cache              Disable build cache"
    echo "  -h, --help              Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 --target production --push"
    echo "  $0 -t development"
    echo "  $0 -t production -i myapp -r myregistry.com -p"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--target)
            BUILD_TARGET="$2"
            shift 2
            ;;
        -i|--image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -p|--push)
            PUSH_IMAGE="true"
            shift
            ;;
        --no-cache)
            BUILD_CACHE="false"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate build target
case $BUILD_TARGET in
    development|production|qa|staging)
        ;;
    *)
        log_error "Invalid build target: $BUILD_TARGET"
        log_info "Valid targets: development, production, qa, staging"
        exit 1
        ;;
esac

# Set image tag based on target and registry
if [ -n "$REGISTRY" ]; then
    FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$BUILD_TARGET"
else
    FULL_IMAGE_NAME="$IMAGE_NAME:$BUILD_TARGET"
fi

# Build Docker image
build_image() {
    log_step "Building Docker image for target: $BUILD_TARGET"
    log_info "Image name: $FULL_IMAGE_NAME"
    
    # Prepare build arguments
    BUILD_ARGS=(
        "--target" "$BUILD_TARGET"
        "--tag" "$FULL_IMAGE_NAME"
        "--file" "$DOCKERFILE"
    )
    
    # Add cache options
    if [ "$BUILD_CACHE" = "true" ]; then
        BUILD_ARGS+=("--cache-from" "$FULL_IMAGE_NAME")
        log_info "Build cache enabled"
    else
        BUILD_ARGS+=("--no-cache")
        log_warn "Build cache disabled"
    fi
    
    # Add BuildKit optimizations
    export DOCKER_BUILDKIT=1
    export BUILDKIT_PROGRESS=plain
    
    # Start timer
    START_TIME=$(date +%s)
    
    log_step "Running docker build..."
    if docker build "${BUILD_ARGS[@]}" .; then
        END_TIME=$(date +%s)
        BUILD_TIME=$((END_TIME - START_TIME))
        log_info "✅ Build completed successfully in ${BUILD_TIME}s"
    else
        log_error "❌ Build failed"
        exit 1
    fi
}

# Push image to registry
push_image() {
    if [ "$PUSH_IMAGE" = "true" ]; then
        if [ -z "$REGISTRY" ]; then
            log_warn "No registry specified, pushing to default registry"
        fi
        
        log_step "Pushing image: $FULL_IMAGE_NAME"
        
        if docker push "$FULL_IMAGE_NAME"; then
            log_info "✅ Image pushed successfully"
        else
            log_error "❌ Failed to push image"
            exit 1
        fi
    else
        log_info "Skipping image push (use --push to enable)"
    fi
}

# Show image info
show_image_info() {
    log_step "Image Information:"
    echo "  Name: $FULL_IMAGE_NAME"
    echo "  Target: $BUILD_TARGET"
    
    # Get image size
    if IMAGE_SIZE=$(docker images --format "table {{.Size}}" "$FULL_IMAGE_NAME" | tail -1 2>/dev/null); then
        echo "  Size: $IMAGE_SIZE"
    fi
    
    # Show layers (if verbose)
    if [ "${VERBOSE:-false}" = "true" ]; then
        log_step "Image layers:"
        docker history "$FULL_IMAGE_NAME" --no-trunc
    fi
}

# Main execution
main() {
    log_info "Starting optimized Docker build process"
    log_info "Target: $BUILD_TARGET"
    
    # Check if Dockerfile exists
    if [ ! -f "$DOCKERFILE" ]; then
        log_error "Dockerfile not found: $DOCKERFILE"
        exit 1
    fi
    
    # Check Docker is available
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Build the image
    build_image
    
    # Show image information
    show_image_info
    
    # Push if requested
    push_image
    
    log_info "🎉 Build process completed successfully!"
    log_info "To run the container: docker run -p 3000:3000 $FULL_IMAGE_NAME"
}

# Run main function
main "$@"