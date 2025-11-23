#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get commit message
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

echo "🔍 Validating commit message..."

# Skip validation for merge commits
if [[ "$COMMIT_MSG" =~ ^Merge ]]; then
  echo -e "${GREEN}✅ Merge commit - validation skipped${NC}"
  exit 0
fi

# Skip validation for revert commits
if [[ "$COMMIT_MSG" =~ ^Revert ]]; then
  echo -e "${GREEN}✅ Revert commit - validation skipped${NC}"
  exit 0
fi

# Conventional commit pattern
# Format: type(scope): subject
# or: type: subject
PATTERN="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+$"

if [[ "$COMMIT_MSG" =~ $PATTERN ]]; then
  # Extract subject (everything after ": ")
  SUBJECT=$(echo "$COMMIT_MSG" | sed -E 's/^[a-z]+(\([^)]+\))?: //')
  
  # Check if subject starts with uppercase letter
  if [[ "$SUBJECT" =~ ^[A-Z] ]]; then
    echo -e "${RED}❌ Invalid commit message format${NC}"
    echo ""
    echo -e "${YELLOW}The subject must start with a lowercase letter${NC}"
    echo ""
    echo "Your commit message:"
    echo "  $COMMIT_MSG"
    echo ""
    echo "Subject starts with: ${SUBJECT:0:1} (uppercase)"
    echo ""
    echo "Examples:"
    echo -e "  ${GREEN}✅ feat: add user authentication${NC}"
    echo -e "  ${GREEN}✅ fix: resolve memory leak${NC}"
    echo -e "  ${GREEN}✅ docs: update readme with examples${NC}"
    echo -e "  ${RED}❌ feat: Add user authentication (uppercase A)${NC}"
    echo -e "  ${RED}❌ docs: Update README (uppercase U)${NC}"
    echo ""
    exit 1
  fi
  
  echo -e "${GREEN}✅ Commit message is valid${NC}"
  
  # Check for uppercase in type
  TYPE=$(echo "$COMMIT_MSG" | grep -oE "^[a-z]+")
  if [[ "$TYPE" != "$(echo "$TYPE" | tr '[:upper:]' '[:lower:]')" ]]; then
    echo -e "${YELLOW}⚠️  Warning: Type should be lowercase${NC}"
  fi
  
  exit 0
else
  echo -e "${RED}❌ Invalid commit message format${NC}"
  echo ""
  echo "Commit messages must follow the Conventional Commits format:"
  echo ""
  echo "Format: <type>(<scope>): <subject>"
  echo "or: <type>: <subject>"
  echo ""
  echo "Valid types:"
  echo "  • feat     - New features"
  echo "  • fix      - Bug fixes"
  echo "  • docs     - Documentation updates"
  echo "  • style    - Code style changes (formatting, etc.)"
  echo "  • refactor - Code refactoring"
  echo "  • perf     - Performance improvements"
  echo "  • test     - Test additions or updates"
  echo "  • build    - Build system changes"
  echo "  • ci       - CI/CD changes"
  echo "  • chore    - Maintenance tasks"
  echo "  • revert   - Revert previous commits"
  echo ""
  echo "Examples:"
  echo -e "  ${GREEN}✅ feat: add user authentication${NC}"
  echo -e "  ${GREEN}✅ fix: resolve memory leak in uploads${NC}"
  echo -e "  ${GREEN}✅ feat(auth): add two-factor authentication${NC}"
  echo -e "  ${GREEN}✅ docs: update readme with new API${NC}"
  echo -e "  ${RED}❌ Added new feature (missing type)${NC}"
  echo -e "  ${RED}❌ Feat: add feature (uppercase type)${NC}"
  echo -e "  ${RED}❌ feat: Add feature (uppercase subject)${NC}"
  echo ""
  echo -e "${YELLOW}Your commit message:${NC}"
  echo "$COMMIT_MSG"
  echo ""
  echo "📚 Documentation: https://www.conventionalcommits.org/"
  
  exit 1
fi
