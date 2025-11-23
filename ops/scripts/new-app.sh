#!/usr/bin/env bash
set -euo pipefail

# new-app.sh <app-name>
# Scaffolds a new application from app-template into ops/terraform/apps/<app-name>/
# Ensures names are tag-policy friendly (lowercase letters, numbers, dashes)

usage() {
  echo "Usage: $0 <app-name>" >&2
  exit 1
}

if [[ ${1:-} == "" ]]; then
  usage
fi

APP_NAME="$1"
if [[ ! "$APP_NAME" =~ ^[a-z0-9-]+$ ]]; then
  echo "Error: <app-name> must be lowercase letters, numbers, and dashes only" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OPS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_TEMPLATE_DIR="$OPS_ROOT/terraform/apps/app-template"
TARGET_DIR="$OPS_ROOT/terraform/apps/$APP_NAME"

if [[ ! -d "$APP_TEMPLATE_DIR" ]]; then
  echo "Error: app-template not found at $APP_TEMPLATE_DIR" >&2
  exit 3
fi

if [[ -d "$TARGET_DIR" ]]; then
  echo "Error: target app folder already exists: $TARGET_DIR" >&2
  exit 4
fi

mkdir -p "$TARGET_DIR"
cp -R "$APP_TEMPLATE_DIR/". "$TARGET_DIR/"

echo "Copied template to $TARGET_DIR"

# cross-platform in-place file replacement using a temp file
replace_in_file() {
  local file="$1"; shift
  local search="$1"; shift
  local replace="$1"; shift
  tmpfile="${file}.tmp.$$"
  sed "s/${search}/${replace}/g" "$file" > "$tmpfile"
  mv "$tmpfile" "$file"
}

for ENV in dev qa prod; do
  ENV_DIR="$TARGET_DIR/$ENV"
  TFVARS="$ENV_DIR/terraform.tfvars.example"
  if [[ -f "$TFVARS" ]]; then
    # Update name_prefix
    replace_in_file "$TFVARS" "nextstack-saas-starter-app-${ENV}" "${APP_NAME}-app-${ENV}"

    # Update tags.environment
    replace_in_file "$TFVARS" "environment = \"${ENV}\"" "environment = \"${ENV}\""

    # Update bucket names to include app name
    # assets
    replace_in_file "$TFVARS" "nextstack-saas-starter-${ENV}-assets-1234" "${APP_NAME}-${ENV}-assets"
    # uploads
    replace_in_file "$TFVARS" "nextstack-saas-starter-${ENV}-uploads-1234" "${APP_NAME}-${ENV}-uploads"

    # Update project tag to app name if present
    replace_in_file "$TFVARS" "project     = \"nextstack-saas-starter\"" "project     = \"${APP_NAME}\""
  fi

done

echo "New app scaffolded at $TARGET_DIR"
echo "Next steps:"
echo "  1) Deploy global if not already:"
echo "     cd ops/global && terraform init && terraform plan -var-file=terraform.tfvars.dev"
echo "     terraform apply -var-file=terraform.tfvars.dev"
echo "  2) Update $TARGET_DIR/*/terraform.tfvars.example with your global outputs (vpc_id, public_subnet_id, private_subnet_ids)"
echo "  3) Deploy app (dev example):"
echo "     cd ops/apps/$APP_NAME/dev && terraform init"
echo "     terraform plan"
echo "     terraform apply"
