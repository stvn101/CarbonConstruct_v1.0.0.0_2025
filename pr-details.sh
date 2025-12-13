#!/bin/bash

# Pull Request Details Script for CarbonConstruct repository
# This script provides detailed information about pull requests

set -e  # Exit on error

# Get repository info from git remote or use defaults
REPO_OWNER="${REPO_OWNER:-stvn101}"
REPO_NAME="${REPO_NAME:-CarbonConstruct_v1.0.0.0_2025}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "========================================="
echo "Pull Request Details"
echo "Repository: ${REPO_OWNER}/${REPO_NAME}"
echo "========================================="
echo ""

# Parse command line arguments first to allow help without auth
if [ "${1:-summary}" = "help" ] || [ "${1:-summary}" = "--help" ] || [ "${1:-summary}" = "-h" ]; then
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  summary [state]    Show summary of PRs (default: open)"
    echo "                     States: open, closed, merged, all"
    echo "  list [state]       Alias for summary"
    echo "  details <number>   Show detailed information for a specific PR"
    echo "  show <number>      Alias for details"
    echo "  all                Show all PRs (open, closed, and merged)"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                      # Show open PRs"
    echo "  $0 summary closed       # Show closed PRs"
    echo "  $0 details 42           # Show details for PR #42"
    echo "  $0 all                  # Show all PRs"
    echo ""
    echo "========================================="
    exit 0
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}ERROR: GitHub CLI (gh) is not installed.${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}ERROR: jq is not installed.${NC}"
    echo "jq is required for JSON parsing."
    echo "Install it using:"
    echo "  macOS: brew install jq"
    echo "  Ubuntu/Debian: sudo apt install jq"
    echo "  Windows: choco install jq"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}ERROR: Not authenticated with GitHub CLI.${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Function to display PR summary
show_pr_summary() {
    local state=$1
    echo -e "${CYAN}Fetching ${state} pull requests...${NC}"
    echo ""
    
    # Fetch PR data with all required fields
    PRS=$(gh pr list --repo "${REPO_OWNER}/${REPO_NAME}" --state "${state}" \
        --json number,title,author,createdAt,updatedAt,state,url,headRefName,baseRefName,mergeable,reviewDecision,additions,deletions \
        2>/dev/null)
    
    if [ -z "$PRS" ] || [ "$PRS" = "[]" ]; then
        echo -e "${YELLOW}No ${state} pull requests found.${NC}"
        return
    fi
    
    # Count PRs
    PR_COUNT=$(echo "$PRS" | jq '. | length')
    echo -e "${GREEN}Found ${PR_COUNT} ${state} pull request(s)${NC}"
    echo ""
    
    # Define format string for better readability
    FORMAT_STRING='
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "PR #\(.number): \(.title)\n" +
        "  Author: \(.author.login)\n" +
        "  Branch: \(.headRefName) → \(.baseRefName)\n" +
        "  State: \(.state)\n" +
        "  Mergeable: \(.mergeable // "unknown")\n" +
        "  Review Decision: \(.reviewDecision // "pending")\n" +
        "  Created: \(.createdAt)\n" +
        "  Updated: \(.updatedAt)\n" +
        "  Changes: +\(.additions) -\(.deletions)\n" +
        "  URL: \(.url)\n"
    '
    
    # Display each PR
    echo "$PRS" | jq -r ".[] | $FORMAT_STRING"
}

# Function to show detailed PR information
show_pr_details() {
    local pr_number=$1
    echo -e "${CYAN}Fetching details for PR #${pr_number}...${NC}"
    echo ""
    
    # Get PR details
    gh pr view "${pr_number}" --repo "${REPO_OWNER}/${REPO_NAME}" 2>/dev/null || {
        echo -e "${RED}ERROR: Could not find PR #${pr_number}${NC}"
        return 1
    }
    
    echo ""
    echo -e "${CYAN}Files changed in PR #${pr_number}:${NC}"
    gh pr diff "${pr_number}" --repo "${REPO_OWNER}/${REPO_NAME}" --name-only 2>/dev/null || {
        echo -e "${YELLOW}Could not retrieve file list${NC}"
    }
    
    echo ""
    echo -e "${CYAN}Checks status for PR #${pr_number}:${NC}"
    gh pr checks "${pr_number}" --repo "${REPO_OWNER}/${REPO_NAME}" 2>/dev/null || {
        echo -e "${YELLOW}No checks found${NC}"
    }
}

# Parse command line arguments
case "${1:-summary}" in
    summary|list)
        STATE="${2:-open}"
        show_pr_summary "$STATE"
        ;;
    details|show)
        if [ -z "$2" ]; then
            echo -e "${RED}ERROR: Please provide a PR number${NC}"
            echo "Usage: $0 details <pr_number>"
            exit 1
        fi
        show_pr_details "$2"
        ;;
    all)
        show_pr_summary "open"
        echo ""
        echo "========================================="
        echo ""
        show_pr_summary "closed"
        echo ""
        echo "========================================="
        echo ""
        show_pr_summary "merged"
        ;;
    *)
        echo -e "${RED}ERROR: Unknown command: $1${NC}"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo -e "${GREEN}✓ Done!${NC}"
echo "========================================="
