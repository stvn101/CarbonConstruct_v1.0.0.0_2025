# Pull Request Cleanup Instructions

## Situation Summary

The repository had a branch cleanup task that was requested multiple times, resulting in duplicate PRs:

- **PR #6** (✅ MERGED): "Clean up branches and create development and experiment branches"
  - Status: Successfully merged on Dec 4, 2025
  - This PR already accomplished the branch cleanup task

- **PR #7** (❌ TO CLOSE): "Clean up repository by removing unnecessary branches"  
  - Status: Still open
  - This is a duplicate of the work done in PR #6

- **PR #8** (❌ TO CLOSE): "Remove outdated pull requests and duplicates"
  - Status: Still open (current PR)
  - This is another duplicate request, created by mistake

## What Needs To Be Done

Since PR #6 has already been merged and accomplished the branch cleanup task, **PRs #7 and #8 should be closed** as they are duplicates.

## How to Close the PRs

### Via GitHub Web Interface:

1. Go to https://github.com/stvn101/loval-carbon-compass/pull/7
2. Scroll down and click "Close pull request"
3. Add a comment like: "Closing as duplicate - this work was already completed in PR #6"

4. Go to https://github.com/stvn101/loval-carbon-compass/pull/8
5. Scroll down and click "Close pull request"  
6. Add a comment like: "Closing as duplicate - requested by mistake, work already completed in PR #6"

### Via GitHub CLI (if installed):

```bash
gh pr close 7 --comment "Closing as duplicate - work already completed in PR #6"
gh pr close 8 --comment "Closing as duplicate - requested by mistake, work already completed in PR #6"
```

## Why Can't This Be Automated?

Pull requests are GitHub entities managed through the GitHub API. They cannot be closed through:
- Git commands (git push, git commit, etc.)
- Code changes in the repository
- Environment restrictions prevent using the GitHub API directly

Therefore, **manual closure through the GitHub interface is required**.

## Other Open PRs

The following PRs are unrelated to the branch cleanup and should be handled separately:

- **PR #1**: Bump js-yaml from 4.1.0 to 4.1.1 (Dependabot security update)
- **PR #4**: Bump glob from 10.4.5 to 10.5.0 (Dependabot security update)
- **PR #5**: Bump vite from 5.4.19 to 5.4.21 (Dependabot security update)

These Dependabot PRs should be reviewed and merged if the security updates are desired.
