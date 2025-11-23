#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

echo "🔍 Validating branch name: $BRANCH_NAME"

# Allow main/master/develop branches
if [[ "$BRANCH_NAME" =~ ^(main|master|develop)$ ]]; then
  echo -e "${GREEN}✅ Base branch - validation skipped${NC}"
  exit 0
fi

# Valid branch patterns
VALID_PATTERNS=(
  "^feature/.+"
  "^fix/.+"
  "^hotfix/.+"
  "^refactor/.+"
  "^docs/.+"
  "^test/.+"
  "^chore/.+"
  "^perf/.+"
  "^ci/.+"
  "^build/.+"
  "^revert/.+"
)

# Check if branch matches any valid pattern
VALID=false
for pattern in "${VALID_PATTERNS[@]}"; do
  if [[ "$BRANCH_NAME" =~ $pattern ]]; then
    VALID=true
    break
  fi
done

if [ "$VALID" = true ]; then
  echo -e "${GREEN}✅ Branch name is valid: $BRANCH_NAME${NC}"
  
  # Additional checks (warnings only)
  if [[ "$BRANCH_NAME" =~ [A-Z] ]]; then
    echo -e "${YELLOW}⚠️  Warning: Branch name contains uppercase letters${NC}"
    echo -e "${YELLOW}   Recommended: Use lowercase (e.g., feature/my-feature)${NC}"
  fi
  
  if [[ "$BRANCH_NAME" =~ _+ ]]; then
    echo -e "${YELLOW}⚠️  Warning: Branch name contains underscores${NC}"
    echo -e "${YELLOW}   Recommended: Use hyphens (e.g., feature/my-feature)${NC}"
  fi
  
  exit 0
else
  echo -e "${RED}❌ Invalid branch name: $BRANCH_NAME${NC}"
  echo ""
  echo "Branch names must follow the pattern: <type>/<description>"
  echo ""
  echo "Valid types:"
  echo "  • feature/   - New features"
  echo "  • fix/       - Bug fixes"
  echo "  • hotfix/    - Urgent production fixes"
  echo "  • refactor/  - Code refactoring"
  echo "  • docs/      - Documentation updates"
  echo "  • test/      - Test additions"
  echo "  • chore/     - Maintenance tasks"
  echo "  • perf/      - Performance improvements"
  echo "  • ci/        - CI/CD changes"
  echo "  • build/     - Build system changes"
  echo ""
  echo "Examples:"
  echo -e "  ${GREEN}✅ feature/user-authentication${NC}"
  echo -e "  ${GREEN}✅ fix/memory-leak-in-uploads${NC}"
  echo -e "  ${GREEN}✅ hotfix/critical-security-patch${NC}"
  echo -e "  ${GREEN}✅ docs/update-readme${NC}"
  echo ""
  echo -e "${YELLOW}Current branch: $BRANCH_NAME${NC}"
  echo ""
  echo "To rename your branch:"
  echo "  git branch -m <type>/<description>"
  echo "  git push origin -u <type>/<description>"
  echo "  git push origin --delete $BRANCH_NAME"
  
  exit 1
fi
