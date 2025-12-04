#!/bin/bash

# Script to push the new branch structure to remote
# This creates main, development, and experiment branches on GitHub

set -e  # Exit on error

echo "========================================="
echo "Push New Branches Script"
echo "========================================="
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "ERROR: Not in a git repository"
    exit 1
fi

# Branches to create/push
BRANCHES=("main" "development" "experiment")

echo "This script will create and push the following branches:"
for branch in "${BRANCHES[@]}"; do
    echo "  • ${branch}"
done
echo ""

# Check if branches exist locally
echo "Checking local branches..."
for branch in "${BRANCHES[@]}"; do
    if git show-ref --verify --quiet "refs/heads/${branch}"; then
        echo "  ✓ ${branch} exists locally"
    else
        echo "  ✗ ${branch} does not exist locally - will be created"
        # Create branch from current HEAD
        git branch "${branch}"
        echo "    ✓ Created ${branch}"
    fi
done
echo ""

# Push branches to remote
echo "Pushing branches to remote..."
for branch in "${BRANCHES[@]}"; do
    echo -n "Pushing ${branch}... "
    if git push -u origin "${branch}"; then
        echo "✓ pushed"
    else
        echo "✗ failed"
        echo "    Note: Branch may already exist on remote or you may lack permissions"
    fi
done

echo ""
echo "========================================="
echo "✓ Branch push completed!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run ./cleanup-branches.sh to delete old branches"
echo "2. Set 'main' as the default branch in GitHub settings"
echo "3. Configure branch protection rules"
