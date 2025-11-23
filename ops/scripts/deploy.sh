#!/usr/bin/env bash
set -euo pipefail

echo "Deprecated: The ops/scripts/deploy.sh helper has been removed. Use Terraform CLI directly."
echo "Examples:"
echo "  Global: cd ops/global && terraform init && terraform plan -var-file=terraform.tfvars.dev && terraform apply -var-file=terraform.tfvars.dev"
echo "  App:    cd ops/apps/<app>/<env> && terraform init && terraform plan -var-file=terraform.tfvars && terraform apply -var-file=terraform.tfvars"
echo "See ops/README.md and ops/apps/README.md for details."
exit 1

usage() {
  cat >&2 <<EOF
Usage:
  $0 global <plan|apply|destroy> [var-file]
  $0 app <app-name> <env> <plan|apply|destroy> [var-file]

Examples:
  $0 global plan
  $0 global apply ops/terraform/global/terraform.tfvars.example
  $0 app nextstack-saas-starter dev plan
  $0 app nextstack-saas-starter prod apply ops/terraform/apps/nextstack-saas-starter/prod/terraform.tfvars
EOF
  exit 1
}

if [[ $# -lt 2 ]]; then
  usage
fi

MODE="$1"
shift

TERRAFORM() {
  terraform "$@"
}

case "$MODE" in
  global)
    ACTION="$1"; shift || true
    VAR_FILE="${1:-}"; [[ -n "${VAR_FILE}" ]] && shift || true
    DIR="$(cd "$(dirname "$0")/.." && pwd)/terraform/global"
    cd "$DIR"
    TERRAFORM init -upgrade
    if [[ -z "${VAR_FILE}" ]]; then VAR_FILE="terraform.tfvars.example"; fi
    case "$ACTION" in
      plan) TERRAFORM plan -var-file="$VAR_FILE";;
      apply) TERRAFORM apply -var-file="$VAR_FILE";;
      destroy) TERRAFORM destroy -var-file="$VAR_FILE";;
      *) usage;;
    esac
    ;;
  app)
    APP_NAME="${1:-}"; ENV="${2:-}"; ACTION="${3:-}"; VAR_FILE="${4:-}"
    if [[ -z "$APP_NAME" || -z "$ENV" || -z "$ACTION" ]]; then usage; fi
    DIR="$(cd "$(dirname "$0")/.." && pwd)/terraform/apps/${APP_NAME}/${ENV}"
    if [[ ! -d "$DIR" ]]; then
      echo "Error: directory not found: $DIR" >&2
      exit 2
    fi
    cd "$DIR"
    TERRAFORM init -upgrade
    if [[ -z "${VAR_FILE}" ]]; then VAR_FILE="terraform.tfvars.example"; fi
    case "$ACTION" in
      plan) TERRAFORM plan -var-file="$VAR_FILE";;
      apply) TERRAFORM apply -var-file="$VAR_FILE";;
      destroy) TERRAFORM destroy -var-file="$VAR_FILE";;
      *) usage;;
    esac
    ;;
  *)
    usage
    ;;

esac
