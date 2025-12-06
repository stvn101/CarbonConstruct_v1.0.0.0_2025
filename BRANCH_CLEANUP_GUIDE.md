# Branch Cleanup Guide

## Summary
This guide documents the branch cleanup process for the loval-carbon-compass repository.

## Current State (Before Cleanup)
The repository has **30 branches** that need to be cleaned up:
- 1 copilot branch: `copilot/clean-up-and-create-branches`
- 3 dependabot branches:
  - `dependabot/npm_and_yarn/glob-10.5.0`
  - `dependabot/npm_and_yarn/js-yaml-4.1.1`
  - `dependabot/npm_and_yarn/vite-5.4.21`
- 26 edit branches: `edit/edt-*` (various UUIDs)

**Note:** The repository did not have a `main` branch initially.

## Desired State
The repository should have only these branches:
1. `main` - Primary branch for production-ready code
2. `development` - Active development branch
3. `experiment` - Experimental features branch

## Actions Taken

### 1. Local Branch Creation
Three new local branches have been created:
```bash
# Created main branch from latest commit
git checkout -b main

# Created development branch from main
git checkout -b development

# Created experiment branch from main  
git checkout -b experiment
```

All branches are based on commit `02f5d84` ("Initial plan").

### 2. Remote Branch Cleanup Required

Due to environment restrictions, **manual cleanup of remote branches is required**.

## Manual Steps to Complete Cleanup

### Option 1: Using GitHub Web Interface
1. Go to: https://github.com/stvn101/loval-carbon-compass/branches
2. Click the trash icon next to each branch to delete (except main, development, experiment)
3. Confirm deletion for each branch

### Option 2: Using GitHub CLI
Run the following commands (requires `gh` CLI tool and proper authentication):

```bash
# Delete copilot branch
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/copilot/clean-up-and-create-branches -X DELETE

# Delete dependabot branches
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/dependabot/npm_and_yarn/glob-10.5.0 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/dependabot/npm_and_yarn/js-yaml-4.1.1 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/dependabot/npm_and_yarn/vite-5.4.21 -X DELETE

# Delete all edit branches
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-0dc58daa-6cb7-4ef4-b69a-0a7fc9f3a35e -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-0e582e8f-3992-4f62-b2d6-08fea3e9491c -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-2b947711-e957-4668-b833-603f1ac2869b -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-2c6e5d65-ce0f-4bc1-a7ec-e8dfdabb6a72 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-5d6ea467-ac5f-4412-9d44-bb8aff529870 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-6ac8ac0a-d49e-4adc-9288-7a6c4fa4841e -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-6ea42f54-6126-4a03-8864-ebe6f94cebed -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-7a1d7950-1939-49c0-83ff-b538688da6aa -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-7c57db67-eacf-4201-a5c1-9e8e96938b55 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-7de7d1ba-e86a-4aa0-9579-6bdab49a17bd -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-13e0e60d-1235-48d6-bd12-da8099ed9ae7 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-21fc3a9c-53ff-477a-a537-4c3ea280cd5b -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-29a7cedf-e856-4f86-b953-96404d244339 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-29e8e79d-1beb-42e1-a9b8-5c96e93b28d9 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-35bb701e-e422-4eae-bc54-1739fa1be0ec -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-41b43b90-9bb2-4f5b-8080-2b424895f6da -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-42ab5b85-0cee-43ee-877e-754b944ba5fa -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-52c1f86e-16b2-4645-bceb-84389990d355 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-85f17daa-1245-41d9-a17f-253f6561d383 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-150c7ac0-dbbe-4da0-9399-60f0dd72e573 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-412ad7dd-a354-4c16-85a3-7733025c3d0a -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-593daeb9-32c6-4f99-b5a3-67142f70c0a6 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-734d294d-cc2b-4092-b6e1-b55531598338 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-856b51bb-5e87-46ec-9d98-3e91170ebbb6 -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-924cc7fa-3968-4f9a-a640-f30ac25c6b9e -X DELETE
gh api repos/stvn101/loval-carbon-compass/git/refs/heads/edit/edt-2966c225-c340-458c-b6a2-f57fb619fc7b -X DELETE
```

### Option 3: Using Git Commands
If you have push access configured:

```bash
# Delete remote branches (after backing up if needed)
git push origin --delete copilot/clean-up-and-create-branches
git push origin --delete dependabot/npm_and_yarn/glob-10.5.0
git push origin --delete dependabot/npm_and_yarn/js-yaml-4.1.1
git push origin --delete dependabot/npm_and_yarn/vite-5.4.21

# Delete all edit branches (26 branches)
for branch in \
  edit/edt-0dc58daa-6cb7-4ef4-b69a-0a7fc9f3a35e \
  edit/edt-0e582e8f-3992-4f62-b2d6-08fea3e9491c \
  edit/edt-2b947711-e957-4668-b833-603f1ac2869b \
  edit/edt-2c6e5d65-ce0f-4bc1-a7ec-e8dfdabb6a72 \
  edit/edt-5d6ea467-ac5f-4412-9d44-bb8aff529870 \
  edit/edt-6ac8ac0a-d49e-4adc-9288-7a6c4fa4841e \
  edit/edt-6ea42f54-6126-4a03-8864-ebe6f94cebed \
  edit/edt-7a1d7950-1939-49c0-83ff-b538688da6aa \
  edit/edt-7c57db67-eacf-4201-a5c1-9e8e96938b55 \
  edit/edt-7de7d1ba-e86a-4aa0-9579-6bdab49a17bd \
  edit/edt-13e0e60d-1235-48d6-bd12-da8099ed9ae7 \
  edit/edt-21fc3a9c-53ff-477a-a537-4c3ea280cd5b \
  edit/edt-29a7cedf-e856-4f86-b953-96404d244339 \
  edit/edt-29e8e79d-1beb-42e1-a9b8-5c96e93b28d9 \
  edit/edt-35bb701e-e422-4eae-bc54-1739fa1be0ec \
  edit/edt-41b43b90-9bb2-4f5b-8080-2b424895f6da \
  edit/edt-42ab5b85-0cee-43ee-877e-754b944ba5fa \
  edit/edt-52c1f86e-16b2-4645-bceb-84389990d355 \
  edit/edt-85f17daa-1245-41d9-a17f-253f6561d383 \
  edit/edt-150c7ac0-dbbe-4da0-9399-60f0dd72e573 \
  edit/edt-412ad7dd-a354-4c16-85a3-7733025c3d0a \
  edit/edt-593daeb9-32c6-4f99-b5a3-67142f70c0a6 \
  edit/edt-734d294d-cc2b-4092-b6e1-b55531598338 \
  edit/edt-856b51bb-5e87-46ec-9d98-3e91170ebbb6 \
  edit/edt-924cc7fa-3968-4f9a-a640-f30ac25c6b9e \
  edit/edt-2966c225-c340-458c-b6a2-f57fb619fc7b
do
  git push origin --delete "$branch"
done
```

## Setting Up Default Branch

After cleanup, set `main` as the default branch:

### Via GitHub Web Interface
1. Go to: https://github.com/stvn101/loval-carbon-compass/settings/branches
2. Under "Default branch", click the switch icon
3. Select `main` from the dropdown
4. Click "Update" and confirm

### Via GitHub CLI
```bash
gh api repos/stvn101/loval-carbon-compass -X PATCH -f default_branch=main
```

## Verification

After completing the cleanup, verify with:
```bash
# List all remote branches
git ls-remote --heads origin

# Should show only:
# main
# development  
# experiment
```

## Notes
- All three new branches (main, development, experiment) are identical and based on commit `02f5d84`
- The branches are created locally and can be pushed when ready
- Consider setting up branch protection rules for `main` after cleanup
- Consider setting up CI/CD workflows for the new branch structure
