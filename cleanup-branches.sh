#!/bin/bash

# Branch Cleanup Script for loval-carbon-compass repository
# This script deletes all branches except main, development, and experiment

set -e  # Exit on error

REPO_OWNER="stvn101"
REPO_NAME="loval-carbon-compass"

echo "========================================="
echo "Branch Cleanup Script"
echo "Repository: ${REPO_OWNER}/${REPO_NAME}"
echo "========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "ERROR: GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "ERROR: Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

echo "Fetching list of branches..."
BRANCHES=$(gh api "repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads" --jq '.[].ref | sub("refs/heads/"; "")')

# Branches to keep
KEEP_BRANCHES=("main" "development" "experiment")

echo ""
echo "Branches to keep:"
for branch in "${KEEP_BRANCHES[@]}"; do
    echo "  ✓ ${branch}"
done
echo ""

# Count branches to delete
DELETE_COUNT=0
TO_DELETE=()

while IFS= read -r branch; do
    # Skip empty lines
    [[ -z "$branch" ]] && continue
    
    # Check if branch should be kept
    KEEP=false
    for keep_branch in "${KEEP_BRANCHES[@]}"; do
        if [[ "$branch" == "$keep_branch" ]]; then
            KEEP=true
            break
        fi
    done
    
    if [[ "$KEEP" == false ]]; then
        TO_DELETE+=("$branch")
        ((DELETE_COUNT++))
    fi
done <<< "$BRANCHES"

if [[ $DELETE_COUNT -eq 0 ]]; then
    echo "No branches to delete. Repository is already clean!"
    exit 0
fi

echo "Found ${DELETE_COUNT} branches to delete:"
for branch in "${TO_DELETE[@]}"; do
    echo "  ✗ ${branch}"
done
echo ""

# Ask for confirmation
read -p "Do you want to delete these ${DELETE_COUNT} branches? (yes/no): " CONFIRMATION

if [[ "$CONFIRMATION" != "yes" ]]; then
    echo "Cancelled. No branches were deleted."
    exit 0
fi

echo ""
echo "Deleting branches..."

DELETED=0
FAILED=0

for branch in "${TO_DELETE[@]}"; do
    echo -n "Deleting ${branch}... "
    if gh api "repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${branch}" -X DELETE &> /dev/null; then
        echo "✓ deleted"
        ((DELETED++))
    else
        echo "✗ failed"
        ((FAILED++))
    fi
done

echo ""
echo "========================================="
echo "Cleanup Summary"
echo "========================================="
echo "Successfully deleted: ${DELETED}"
echo "Failed: ${FAILED}"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo "✓ Branch cleanup completed successfully!"
    echo ""
    echo "Remaining branches:"
    gh api "repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads" --jq '.[].ref | sub("refs/heads/"; "")' | while read -r branch; do
        echo "  • ${branch}"
    done
else
    echo "⚠ Some branches could not be deleted. Please check permissions and try again."
fi

echo ""
echo "Next steps:"
echo "1. Set 'main' as the default branch in GitHub settings"
echo "2. Set up branch protection rules for 'main'"
echo "3. Configure CI/CD workflows for the new branch structure"
