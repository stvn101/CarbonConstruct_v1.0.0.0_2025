# Pull Request Management Guide

## Overview
This guide provides comprehensive information about managing pull requests in the CarbonConstruct repository, including tools, workflows, and best practices.

## Table of Contents
1. [Quick Start](#quick-start)
2. [PR Details Script](#pr-details-script)
3. [Creating Pull Requests](#creating-pull-requests)
4. [Reviewing Pull Requests](#reviewing-pull-requests)
5. [PR Status and Checks](#pr-status-and-checks)
6. [Merging Pull Requests](#merging-pull-requests)
7. [Best Practices](#best-practices)

## Quick Start

### Prerequisites
- GitHub CLI (`gh`) installed and authenticated
- Repository access permissions
- Git configured locally

### Installation
```bash
# Install GitHub CLI (if not already installed)
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Windows
winget install --id GitHub.cli

# Authenticate
gh auth login
```

## PR Details Script

The `pr-details.sh` script provides an easy way to view detailed information about pull requests in the repository.

### Usage

#### View Open Pull Requests
```bash
./pr-details.sh
# or
./pr-details.sh summary open
```

#### View Closed Pull Requests
```bash
./pr-details.sh summary closed
```

#### View Merged Pull Requests
```bash
./pr-details.sh summary merged
```

#### View All Pull Requests
```bash
./pr-details.sh all
```

#### View Detailed Information for a Specific PR
```bash
./pr-details.sh details <PR_NUMBER>
# Example:
./pr-details.sh details 42
```

### Script Features

The script provides the following information for each PR:
- **PR Number and Title**: Clear identification
- **Author**: Who created the PR
- **Branch Information**: Source and target branches
- **State**: Open, closed, or merged
- **Mergeable Status**: Whether the PR can be merged
- **Review Decision**: Approval status
- **Timestamps**: Created and last updated dates
- **Code Changes**: Lines added and deleted
- **Direct URL**: Link to the PR on GitHub

For detailed PR views, the script also shows:
- Full PR description
- List of changed files
- CI/CD check status
- Review comments

## Creating Pull Requests

### Using GitHub CLI
```bash
# Create a PR from current branch to main
gh pr create --base main --title "Your PR title" --body "Description"

# Create a PR with interactive prompts
gh pr create

# Create a draft PR
gh pr create --draft

# Create a PR and assign reviewers
gh pr create --reviewer username1,username2
```

### Using the Web Interface
1. Navigate to: https://github.com/stvn101/CarbonConstruct_v1.0.0.0_2025/pulls
2. Click "New pull request"
3. Select your branch and target branch
4. Fill in the PR template (see `.github/PULL_REQUEST_TEMPLATE.md`)
5. Click "Create pull request"

### PR Template Checklist

When creating a PR, ensure you complete the following (from the template):

- [ ] Brief description of changes provided
- [ ] Type of change selected (bug fix, feature, breaking change, docs)
- [ ] Tests pass locally (`npm test`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] No new linting errors
- [ ] Security considerations reviewed
- [ ] WCAG 2.1 AA accessibility maintained
- [ ] Testing approach documented
- [ ] Screenshots added (for UI changes)

## Reviewing Pull Requests

### Viewing PR Details
```bash
# View PR in terminal
gh pr view <PR_NUMBER>

# View PR in browser
gh pr view <PR_NUMBER> --web

# View PR diff
gh pr diff <PR_NUMBER>

# Checkout PR locally for testing
gh pr checkout <PR_NUMBER>
```

### Adding Reviews
```bash
# Approve a PR
gh pr review <PR_NUMBER> --approve

# Request changes
gh pr review <PR_NUMBER> --request-changes --body "Please address these issues..."

# Add a comment
gh pr review <PR_NUMBER> --comment --body "Looks good, minor suggestions..."
```

### Checking PR Status
```bash
# Check CI/CD status
gh pr checks <PR_NUMBER>

# View PR status
gh pr status
```

## PR Status and Checks

### Understanding PR States

- **Open**: PR is ready for review or being worked on
- **Draft**: PR is work in progress, not ready for review
- **Closed**: PR was closed without merging
- **Merged**: PR was successfully merged into the target branch

### CI/CD Checks

The repository runs the following checks on PRs:
- **Build**: Ensures code compiles (`npm run build`)
- **Lint**: Checks code style (`npm run lint`)
- **Tests**: Runs test suite (`npm test`)
- **Type Check**: Validates TypeScript types
- **Security Scan**: Checks for vulnerabilities

View check details:
```bash
./pr-details.sh details <PR_NUMBER>
```

## Merging Pull Requests

### Prerequisites for Merging
- All CI/CD checks must pass
- At least one approval (if required by branch protection)
- No merge conflicts
- Review decision is "Approved"

### Merge Methods

#### Using GitHub CLI
```bash
# Merge and squash commits
gh pr merge <PR_NUMBER> --squash

# Merge with merge commit
gh pr merge <PR_NUMBER> --merge

# Rebase and merge
gh pr merge <PR_NUMBER> --rebase

# Auto-merge when checks pass
gh pr merge <PR_NUMBER> --auto --squash
```

#### Using Web Interface
1. Navigate to the PR page
2. Ensure all checks are green
3. Click "Merge pull request"
4. Select merge method (squash, merge commit, or rebase)
5. Confirm the merge

### After Merging
```bash
# Delete the branch after merging
gh pr merge <PR_NUMBER> --delete-branch --squash

# Update your local repository
git checkout main
git pull origin main
```

## Best Practices

### Creating PRs
1. **Keep PRs Small**: Smaller PRs are easier to review and less likely to introduce bugs
2. **Clear Titles**: Use descriptive titles that explain what the PR does
3. **Detailed Descriptions**: Provide context, motivation, and testing approach
4. **Link Issues**: Reference related issues using `#issue_number`
5. **Update Tests**: Add or update tests for your changes
6. **Clean Commits**: Use meaningful commit messages

### Reviewing PRs
1. **Review Promptly**: Aim to review PRs within 24 hours
2. **Be Constructive**: Provide specific, actionable feedback
3. **Test Locally**: Check out the PR and test it locally when possible
4. **Check for Edge Cases**: Consider unusual scenarios and error handling
5. **Security Review**: Look for potential security vulnerabilities
6. **Accessibility**: Ensure WCAG 2.1 AA compliance for UI changes

### Maintaining PRs
1. **Keep Updated**: Regularly sync with the base branch
2. **Address Feedback**: Respond to review comments promptly
3. **Update Tests**: Ensure tests reflect your changes
4. **Resolve Conflicts**: Fix merge conflicts as soon as they appear
5. **Clean Up**: Delete branches after merging

## Common Commands Reference

```bash
# List all open PRs
gh pr list

# List all PRs (including closed)
gh pr list --state all

# Search PRs by author
gh pr list --author username

# Search PRs by label
gh pr list --label "bug"

# View PR in browser
gh pr view <PR_NUMBER> --web

# Checkout a PR locally
gh pr checkout <PR_NUMBER>

# Create a PR
gh pr create

# Update PR title
gh pr edit <PR_NUMBER> --title "New title"

# Add labels to PR
gh pr edit <PR_NUMBER> --add-label "enhancement,documentation"

# Close a PR without merging
gh pr close <PR_NUMBER>

# Reopen a closed PR
gh pr reopen <PR_NUMBER>

# View your PR status
gh pr status
```

## Using the PR Details Script

### Get Help
```bash
./pr-details.sh help
```

### Examples

#### Example 1: Quick Overview of Open PRs
```bash
./pr-details.sh
```
Output shows:
- PR numbers and titles
- Authors
- Branch information
- Review status
- Line changes
- Direct links

#### Example 2: Check All PRs
```bash
./pr-details.sh all
```
Shows open, closed, and merged PRs in separate sections.

#### Example 3: Deep Dive into a Specific PR
```bash
./pr-details.sh details 42
```
Shows:
- Full PR description
- Complete metadata
- List of changed files
- CI/CD check status
- Review comments

## Troubleshooting

### Authentication Issues
```bash
# Check authentication status
gh auth status

# Re-authenticate
gh auth login
```

### Permission Issues
Ensure you have the appropriate permissions:
- Read access: View PRs
- Write access: Create PRs and review
- Admin access: Merge PRs (depending on branch protection)

### Script Not Working
```bash
# Make script executable
chmod +x pr-details.sh

# Verify GitHub CLI is installed
gh --version

# Check if jq is installed (required for JSON parsing)
jq --version
```

If `jq` is missing, install it:
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt install jq

# Windows (via Chocolatey)
choco install jq
```

## Integration with Development Workflow

### Daily Workflow
1. Check PR status in the morning:
   ```bash
   ./pr-details.sh
   ```

2. Review assigned PRs:
   ```bash
   gh pr list --search "review-requested:@me"
   ```

3. Check your open PRs:
   ```bash
   gh pr status
   ```

### Pre-Merge Checklist
Before merging any PR:
- [ ] All CI/CD checks pass
- [ ] Code reviewed and approved
- [ ] No merge conflicts
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Security considerations addressed
- [ ] Accessibility maintained

## Related Documentation

- [PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) - PR template
- [BRANCH_CLEANUP_GUIDE.md](BRANCH_CLEANUP_GUIDE.md) - Branch management
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [SECURITY.md](SECURITY.md) - Security policies

## Support

For issues or questions:
1. Check this guide first
2. Review the GitHub CLI documentation: https://cli.github.com/manual/
3. Open an issue in the repository
4. Contact the repository maintainers

## Additional Resources

- [GitHub CLI Manual](https://cli.github.com/manual/)
- [GitHub Pull Requests Documentation](https://docs.github.com/en/pull-requests)
- [Git Branch Management](https://git-scm.com/book/en/v2/Git-Branching-Branch-Management)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)
