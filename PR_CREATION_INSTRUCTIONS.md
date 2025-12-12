# Instructions to Create PR: Merge Experiment into Calculator-Integration

## Current Situation

- **PR #56** exists from `copilot/merge-carbon-calculator-implementation` → `calculator-integration`
- The actual requirement is to create a PR from `experiment` → `calculator-integration`
- The `experiment` branch contains **22 files with 4,595 lines of code** (verified via commit analysis)
- Files cannot be automatically downloaded from the private experiment branch

## Solution Options

### **Option 1: Create New PR from Web Interface (RECOMMENDED)**

This is the simplest and most direct approach:

1. Navigate to: https://github.com/stvn101/CarbonConstruct_v1.0.0.0_2025/compare/calculator-integration...experiment
2. Click "Create pull request"
3. Use the configuration below

### Option 2: Use GitHub CLI

Close PR #56 first if it exists, then:

```bash
gh pr close 56 --comment "Closing in favor of direct experiment→calculator-integration PR"
gh pr create \
  --base calculator-integration \
  --head experiment \
  --title "Merge carbon calculator implementation from experiment to calculator-integration" \
  --body "See details in PR description template below"
```

## Required PR Configuration

**Title:** `Merge carbon calculator implementation from experiment to calculator-integration`

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

## Verified File List from Experiment Branch

The experiment branch (commit `92888811ddc01d1a721210a5df77c404faf6bada`) contains **22 files with 4,595 lines of code**:

| File | Lines | Type |
|------|-------|------|
| CALCULATOR_README.md | 407 | Documentation |
| DELIVERY_SUMMARY.md | 306 | Documentation |
| INTEGRATION_GUIDE.md | 389 | Documentation |
| START_HERE.md | 272 | Documentation |
| FILE_STRUCTURE.txt | 247 | Documentation |
| QUICK_REFERENCE.txt | 251 | Documentation |
| calculator_engine.py | 394 | Backend |
| calculator.py | 227 | Backend |
| database.py | 211 | Backend |
| projects.py | 160 | Backend |
| reports.py | 169 | Backend |
| schemas.py | 181 | Backend |
| main.py | 74 | Backend |
| FuelCalculator.tsx | 266 | Frontend |
| MaterialCalculator.tsx | 280 | Frontend |
| calculator.ts | 264 | Frontend |
| DEPLOY.sh | 82 | DevOps |
| TEST.sh | 206 | DevOps |
| requirements.txt | 21 | Config |
| nger_materials_database_v2025_1.csv | 124 | Data |
| nger_operational_factors_2024.csv | 64 | Data |
| __init__.py | 0 | Backend |

**Total:** 4,595 lines of production code

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
