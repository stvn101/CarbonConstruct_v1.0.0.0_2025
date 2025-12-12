# Instructions to Create PR: Merge Experiment into Calculator-Integration

## Current Situation

PR #56 exists but is from the wrong head branch. We need to create a new PR or close #56 and create a fresh one.

## Required PR Configuration

**Title:** Merge carbon calculator implementation from experiment to calculator-integration

**Base Branch:** `calculator-integration`  
**Head Branch:** `experiment`

**Description:**
```
This PR merges the complete carbon calculator implementation from the `experiment` branch into `calculator-integration` for integration testing before merging to main.

## What's Included

### Backend (FastAPI)
- FastAPI application with 15+ endpoints
- Core calculation engine (calculator_engine.py)
- SQLite database management  
- Project and report management
- Pydantic schemas for validation

### Frontend (React/TypeScript)
- FuelCalculator component
- MaterialCalculator component
- TypeScript calculation utilities

### Data
- 186 NGER emission factors (nger_materials_database_v2025_1.csv)
- Operational factors (nger_operational_factors_2024.csv)

### Infrastructure
- Deployment scripts (DEPLOY.sh, TEST.sh)
- Python dependencies (requirements.txt)
- Comprehensive documentation

## Testing Before Merge

- [ ] Backend API starts correctly
- [ ] Database initializes with NGER factors
- [ ] Frontend calculator components render
- [ ] No conflicts with existing code
- [ ] Integration tests pass

## Files Added (23 total)

Python Backend:
- main.py
- calculator_engine.py
- calculator.py
- database.py
- projects.py
- reports.py
- schemas.py
- __init__.py
- requirements.txt

React/TypeScript:
- FuelCalculator.tsx
- MaterialCalculator.tsx
- calculator.ts

Data:
- nger_materials_database_v2025_1.csv
- nger_operational_factors_2024.csv

Scripts:
- DEPLOY.sh
- TEST.sh

Documentation:
- CALCULATOR_README.md
- DELIVERY_SUMMARY.md
- INTEGRATION_GUIDE.md
- START_HERE.md
- FILE_STRUCTURE.txt
- QUICK_REFERENCE.txt

## Next Steps After Merge

1. Integration testing in calculator-integration branch
2. Address any integration issues
3. Prepare merge to main after validation
```

## How to Create the PR

### Option 1: Using GitHub Web Interface

1. Go to: https://github.com/stvn101/CarbonConstruct_v1.0.0.0_2025/compare
2. Set base branch to: `calculator-integration`
3. Set compare branch to: `experiment`
4. Click "Create pull request"
5. Use the title and description above
6. Create the PR

### Option 2: Using GitHub CLI

```bash
gh pr create \
  --base calculator-integration \
  --head experiment \
  --title "Merge carbon calculator implementation from experiment to calculator-integration" \
  --body-file PR_BODY.md
```

(Where PR_BODY.md contains the description from above)

### Option 3: Close PR #56 and Create New One

If PR #56 should be closed:

```bash
gh pr close 56
gh pr create --base calculator-integration --head experiment --title "..." --body "..."
```

## Important Notes

1. This is a **feature addition** merge - no existing files are modified
2. The 23 new files are independent and can be integrated progressively  
3. This is a testing integration before final merge to main
4. All files come from the `experiment` branch (SHA: 92888811ddc01d1a721210a5df77c404faf6bada)

## Verification

After PR creation, verify:
- ✓ Base branch is `calculator-integration`
- ✓ Head branch is `experiment`
- ✓ Files changed shows ~23 new files
- ✓ No conflicts reported
- ✓ Description clearly outlines what's being merged
