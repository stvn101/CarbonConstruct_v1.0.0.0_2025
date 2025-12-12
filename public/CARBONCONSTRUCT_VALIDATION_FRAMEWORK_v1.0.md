# CarbonConstruct Materials Database Validation Framework v1.0
## Comprehensive Quality Assurance & Transparency Protocol

---

## EXECUTIVE SUMMARY

This framework defines:
1. **What gets validated** (data integrity, EPD verification, unit consistency, range checking)
2. **How issues are flagged** (severity levels, remediation paths, documentation)
3. **What customers see** (confidence levels, data sources, methodology transparency)
4. **Monthly validation process** (automated checks + manual review gates)

**Core Principle:** Be obsessively transparent about data quality. This is your competitive advantage vs OneClickLCA/eTool.

---

## PART 1: VALIDATION ARCHITECTURE

### 1.1 Validation Layers (In Order of Execution)

```
LAYER 1: DATA INTEGRITY
├─ Null value checks (ef_total, A1-A3, units, categories)
├─ Data type validation (numbers are numeric, dates are valid)
├─ Unit field consistency (matches declared unit)
└─ EPD number format validation (S-P-XXXXX pattern matching)

LAYER 2: EPD REGISTRY VERIFICATION
├─ S-P- numbers cross-referenced against EPD Australasia live registry
├─ EPD registration status (active, expired, superseded)
├─ EPD validity date checks
└─ Flagged: Invalid/expired registrations → CRITICAL

LAYER 3: NABERS RANGE VALIDATION
├─ Emission factors checked against NABERS v2025.1 expected ranges
├─ Regional variations documented (coal vs hydro grids)
├─ Unit-appropriate comparisons (m³ vs tonne vs m²)
└─ Flagged: >20% outside range → REVIEW REQUIRED

LAYER 4: UNIT CONSISTENCY
├─ All materials in same category use consistent units
├─ Conversion factors documented (1 tonne = 1000 kg)
├─ Per-unit values normalized for comparison
└─ Flagged: Mixed units within category → NEEDS CONVERSION

LAYER 5: SOURCE CREDIBILITY
├─ EPD Australasia (Tier 1: Most Verified)
├─ NABERS cross-referenced (Tier 1)
├─ ICM Database 2019 (Tier 2: Industry Average)
├─ International EPDs (Tier 2: Needs grid context)
├─ Other sources (Tier 3: Requires review)
└─ Flagged: Tier 3 materials require documentation

LAYER 6: OUTLIER DETECTION
├─ Statistical analysis (mean ± 2 std dev per category)
├─ Contextual justification required for outliers
├─ Regional/manufacturing variations documented
└─ Flagged: Unexplained outliers → INVESTIGATE
```

---

## PART 2: ISSUE SEVERITY & RESPONSE

### 2.1 Severity Levels

#### CRITICAL 🔴 (Blocks Launch/Usage)
- **Invalid EPD registration numbers** (S-P- number doesn't exist)
- **Null values in required fields** (ef_total, unit, category missing)
- **Data type mismatches** (text where numbers expected)
- **Impossible values** (negative carbon factors)
- **Action:** Remove from database immediately OR correct source data

#### HIGH ⚠️ (Requires Investigation)
- **Expired EPD registrations** (validity date passed)
- **>30% outside NABERS range** (unless documented)
- **Mixed units within category** (m³ and m² for same product type)
- **Missing EPD registration number** (where EPD-sourced)
- **Action:** Verify with manufacturer → correct or flag with confidence level

#### MEDIUM 🟡 (Monitor/Document)
- **>20% outside NABERS range** (with valid explanation)
- **Regional grid variations** (China coal vs European hydro)
- **Recycled content variations** (affects carbon significantly)
- **ICM Database industry averages** (less precise but valid for hybrid LCA)
- **Action:** Document context → add to UI tooltips

#### LOW 🔵 (Informational)
- **Minor unit variations** (kg vs tonne, properly converted)
- **Metadata gaps** (missing manufacturer, but data valid)
- **Regional variants** (WA Premix different from NSW Concrite)
- **Action:** Document in database record → use for material comparisons

---

## PART 3: SPECIFIC VALIDATION RULES

### 3.1 Concrete Materials (2,047 records)

**Expected Ranges (NABERS v2025.1):**
| Strength | Range | Notes |
|----------|-------|-------|
| 10-20 MPa | 136-364 kgCO2e/m³ | Standard concretes |
| 20-25 MPa | 149-417 kgCO2e/m³ | Common grades |
| 25-32 MPa | 167-459 kgCO2e/m³ | Structural |
| 32-40 MPa | 198-545 kgCO2e/m³ | High strength |
| 40-50 MPa | 101-609 kgCO2e/m³ | Premium |
| Mortars | 205-1,270 kgCO2e/m³ | Specialty grouts (cement-rich) |

**Validation Rules:**
- ✅ WA Premix mortars EV1113/EV1115 at 1,240-1,270: VALID (specialty high-cement)
- ⚠️ Values >20% above range: Flag as REVIEW if no grid/cement documentation
- 📝 Document manufacturing location (affects embodied carbon significantly)
- 🔄 Unit check: Must be m³, not tonne (density ~2,400 kg/m³)

**Critical Checks:**
```
IF concrete.ef_total > 700 AND concrete.location NOT IN ('China', 'India')
  THEN flag_review("Coal-grid values for non-coal region")

IF concrete.mortar_flag = TRUE AND concrete.ef_total < 200
  THEN flag_critical("Mortar carbon too low - verify formulation")

IF concrete.cement_content_pct NOT DOCUMENTED AND concrete.ef_total > 500
  THEN flag_high("High-carbon concrete needs cement % documentation")
```

---

### 3.2 Steel Materials (141 records)

**Expected Ranges (NABERS v2025.1):**
| Type | Range | Notes |
|------|-------|-------|
| Virgin structural | 2,500-3,500 kgCO2e/t | Hot-rolled, electric furnace |
| Recycled | 400-1,200 kgCO2e/t | Scrap-based |
| High-strength | 3,000-4,000 kgCO2e/t | Alloyed grades |

**Critical Issues from Audit:**
- 🔴 **CRITICAL:** Verify steel materials at 0.13 kgCO2e/tonne
  - If real: Must be 100% recycled with renewable energy grid
  - Needs documentation: Recycled content %, grid location
  - If error: Remove or correct immediately

**Validation Rules:**
```
IF steel.ef_total < 500 kgCO2e/t
  THEN require(recycled_content_pct, energy_grid_location, epd_number)
  THEN flag_high("Ultra-low carbon steel - verify source")

IF steel.recycled_content_pct > 0 AND steel.ef_total > 2000
  THEN flag_review("Recycled content high but carbon not low - check calculation")

IF steel.country_of_origin = 'Australia' AND steel.ef_total NOT BETWEEN 2000-3200
  THEN flag_review("Australian steel typically 2000-3200 range")
```

---

### 3.3 Aluminium Materials (62 records)

**Expected Ranges (NABERS v2025.1):**
| Type | Range | Notes |
|------|-------|-------|
| Primary (virgin) | 8,000-20,000 kgCO2e/t | Depends heavily on smelter grid |
| Recycled | 800-3,000 kgCO2e/t | Scrap + refining |
| Smelted (hydro) | 5,000-8,000 kgCO2e/t | Hydro-powered |
| Smelted (coal) | 12,000-20,000 kgCO2e/t | Coal-intensive grids |

**Audit Finding:** 15 materials flagged for regional variance - this is CORRECT
- China/India coal-intensive: 21,000-28,800 kgCO2e/t ✅ Valid
- European hydro-powered: 6,800-7,400 kgCO2e/t ✅ Valid
- Recycled: 3,500-4,000 kgCO2e/t ✅ Valid

**Validation Rules:**
```
IF aluminium.country_of_origin = 'China' OR 'India'
  THEN accept_range_up_to(28800)
  THEN document_reason("Coal-intensive smelter grid")

IF aluminium.recycled_content_pct > 50 AND aluminium.ef_total > 5000
  THEN flag_review("High recycled % but carbon not reduced - check EPD")

IF aluminium.primary_source_pct > 90 AND aluminium.country_of_origin NOT IN ('China', 'India', 'Russia')
  THEN flag_review("Verify smelter grid - primary aluminum highly grid-dependent")
```

---

### 3.4 Timber Materials (67 records)

**Expected Ranges (NABERS v2025.1):**
| Type | Range | Notes |
|------|-------|-------|
| Solid softwood | 113-332 kgCO2e/m³ | Pine, radiata |
| Solid hardwood | 104-563 kgCO2e/m³ | Broader range |
| GLT/CLT | 53-706 kgCO2e/m³ | Engineered - higher processing |
| LVL | 94-402 kgCO2e/m³ | Engineered wood |
| Plywood | 235-922 kgCO2e/m³ | Adhesives + processing |

**Audit Finding:** 3 materials >1,000 flagged - assessment CORRECT
- Engineered timber with adhesives/processing: Valid explanation
- Need to verify they're NOT composite with foam/plastic

**Validation Rules:**
```
IF timber.ef_total > 1000
  THEN require(product_type IN ('CLT', 'GLT', 'Plywood', 'LVL'))
  THEN require(adhesive_type, processing_stage_count)

IF timber.country_of_origin = 'Australia' AND timber.ef_total < 200
  THEN flag_review("Verify Australian sourcing - usually higher processing")

IF timber.embodied_carbon_negative = TRUE
  THEN require(biogenic_carbon_credit_documentation)
  THEN require(epd_number)
```

---

### 3.5 Glass Materials (87 records)

**Expected Ranges (NABERS v2025.1):**
| Type | Range | Notes |
|------|-------|-------|
| Float glass | 0.8-2.5 kgCO2e/m² | Basic glazing |
| Processed glass | 2-6 kgCO2e/m² | Tinted, coated |
| Insulated units | 8-20 kgCO2e/m² | Multiple panes + seals |

**Audit Issue:** Unit confusion (per-m² vs per-kg vs per-tonne)
- 🔴 **CRITICAL:** Verify and normalize all glass units
- Glass measured per m² (coverage area) not weight
- Any per-kg entries need conversion factor documentation

**Validation Rules:**
```
IF glass.declared_unit NOT IN ('m²', 'm2')
  THEN flag_critical("Glass must be per m² - convert or verify")

IF glass.ef_total > 50 AND glass.declared_unit = 'm²'
  THEN flag_review("Glass factors >50/m² unusual - verify unit")

IF glass.product_type = 'Insulated' AND glass.ef_total < 5
  THEN flag_high("Insulated glass typically >8 kgCO2e/m² - verify layers")
```

---

### 3.6 Asphalt & Aggregates (302 records)

**Issue from Audit:** Only 27/302 have manufacturer (8.9%)

**Expected Ranges:**
| Type | Range | Notes |
|------|-------|-------|
| Asphalt (road) | 40-150 kgCO2e/t | Depends on binder % |
| Asphalt (building) | 60-180 kgCO2e/t | Thicker applications |
| Aggregate (quarried) | 0-20 kgCO2e/t | Minimal processing |

**Validation Rules:**
```
IF asphalt.manufacturer_count < 1 AND asphalt.source = 'ICM'
  THEN flag_medium("Industry average - acceptable for hybrid LCA")
  THEN add_ui_note("This is typical industry carbon, not product-specific EPD")

IF asphalt.binder_percentage NOT DOCUMENTED AND asphalt.ef_total > 150
  THEN flag_high("High binder% usually needed - document assumption")

IF aggregate.processing_stage NOT DOCUMENTED
  THEN add_ui_note("Quarried only - crushed/screened would be higher")
```

---

## PART 4: AUTOMATION IMPLEMENTATION

### 4.1 Monthly Validation Process (Lovable/Opus 4.5)

**Step 1: EPD Registry Cross-Check (Weekly)**
```
FOR each material WHERE source = 'EPD Australasia' OR 'International'
  FETCH epd_registration_number
  CROSS_CHECK against EPD Australasia live API / registry
  IF not_found:
    flag_critical("Invalid EPD - fabrication risk")
    LOG_INCIDENT
  IF expired:
    flag_high("EPD expired - replace with current version")
  IF superseded:
    flag_high("Newer EPD available - update reference")
```

**Step 2: Data Integrity Check (Monthly)**
```
Run against all 4,046 materials:

1. NULL value checks
   - ef_total, unit, category: MUST have values
   - manufacturer, epd_number: SHOULD have (if EPD-sourced)
   
2. Data type validation
   - ef_total: NUMERIC (positive)
   - dates: ISO 8601 format
   - category: STRING matching controlled vocabulary
   
3. Unit field consistency
   - declared_unit matches actual data unit
   - no mixing (e.g., "m³" but data in tonne)
   
4. Reference integrity
   - All foreign keys valid
   - No orphaned material records
```

**Step 3: NABERS Range Validation (Monthly)**
```
FOR each material category:
  FETCH NABERS expected range for that category
  
  FOR each material IN category:
    IF ef_total outside_range:
      IF variance < 10%: flag_low
      IF variance 10-20%: flag_medium
      IF variance 20-30%: flag_high
      IF variance > 30%: flag_critical (unless documented)
      
      IF documented_reason (regional, recycled, special class):
        Add confidence_level = "documented_outlier"
        Store justification_text
      ELSE:
        Add confidence_level = "needs_review"
        Queue for manual investigation
```

**Step 4: Unit Consistency Check (Monthly)**
```
FOR each material_category:
  FETCH all unit types in use
  IF multiple units used:
    IF documented_conversion_factors: OK
    IF no_conversion_factors: flag_high("Mixed units - add conversions")
  
  Calculate unit_consistency_score = units_consistent / total_materials
  Report: "Concrete 99% unit consistent, Glass 45% (per-m² vs per-kg confusion)"
```

**Step 5: Outlier Detection (Monthly)**
```
FOR each material_category:
  Calculate mean, std_dev of ef_total (per unit)
  
  FOR each material:
    IF value > mean + (2 * std_dev):
      flag_review("Outlier - 2σ above mean")
      IF documented_reason: accept
      ELSE: investigate
    
  Generate report:
    "Concrete: 3 outliers identified (specialty mortars, coal grid variants)"
    "Steel: 1 critical outlier (0.13 kgCO2e/t - VERIFY RECYCLED CONTENT)"
```

**Step 6: Source Credibility Assessment (Monthly)**
```
Categorize all materials by tier:

TIER 1 (Most Verified):
- EPD Australasia verified
- NABERS cross-referenced
- Count: 2,939 materials (72.6%)

TIER 2 (Industry Average):
- ICM Database 2019
- International EPDs (with grid context)
- Count: 1,005 materials (24.8%)

TIER 3 (Requires Review):
- Other sources, minimal documentation
- Count: 102 materials (2.5%)

Flag any material moving DOWN tiers (e.g., Tier 1 → Tier 3)
```

**Step 7: Generate Reports**

**For Internal Team (Admin Dashboard):**
```
- Data Quality Score: 98.4% pass rate
- Critical Issues: 0 (mortars verified)
- High Priority: 3 (steel outliers need investigation)
- Medium Priority: 12 (unit conversions needed)
- Monthly Trend: ↑ +0.2% from last month
- Materials Needing Action: [list with owner assigned]
```

**For Customers (Public Status Page):**
```
- Total Materials: 4,046
- Validated: 98.4%
- Data Sources: 22
- Confidence Levels: Green/Yellow/Orange icons
- Last Validation: [timestamp]
- Next Validation: [date]
- Methodology: NABERS v2025.1 + Layer 1-6 validation
```

---

## PART 5: CUSTOMER-FACING TRANSPARENCY

### 5.1 Material Confidence Levels (UI Labels)

**🟢 GREEN - Verified EPD**
- EPD Australasia registered (S-P-XXXXX)
- NABERS cross-referenced
- Product-specific manufacturer data
- Best for: Compliance, detailed LCA work
- Example: "Concrete 20 MPa (Holcim) - kgCO2e/m³"

**🟡 YELLOW - Documented Variant**
- EPD registered but regional/manufacturing variation
- Context documented (coal grid, recycled content, etc.)
- Good for: Regional comparison, rough estimates
- Example: "Aluminium Extruded (China) - Coal-intensive smelter grid"

**🟠 ORANGE - Industry Average**
- ICM Database 2019 or similar industry standard
- Not product-specific but reliable for hybrid LCA
- Acceptable for: Preliminary estimates, material families
- Example: "Asphalt (typical) - Industry average"

**🔴 RED - Needs Review**
- Outlier value without clear explanation
- Flagged for manual investigation
- Avoid until: Team verifies source and justification
- Example: "Steel (0.13 kgCO2e/t) - VERIFY RECYCLED CONTENT"

### 5.2 UI Tooltip Structure

**Material Card Tooltip:**
```
Material: Concrete 20 MPa (Holcim, WA)
Confidence: 🟢 Verified EPD
Carbon Factor: 207 kgCO2e/m³
Unit: per cubic metre
Data Source: EPD Australasia (S-P-04660)
Valid Until: 2027-01-27
Last Updated: 2025-12-04

Why this value?
- Manufactured in Western Australia
- Standard grid electricity mix
- No reinforcement included
- Transport not included (Scope A1-A3 only)

Regional variations available:
- NSW version: 149 kgCO2e/m³ (lower grid carbon)
- QLD version: 151 kgCO2e/m³ (coal grid offset)
- VIC version: 208 kgCO2e/m³ (similar grid)
```

**Unit Explanation Tooltip:**
```
📏 kgCO2e/m³

This is CARBON PER CUBIC METRE of material

How to use it:
1. Measure material volume in m³
2. Multiply volume × this factor
3. Result = total embodied carbon

Example:
- 100 m³ of concrete at 207 kgCO2e/m³
- 100 × 207 = 20,700 kgCO2e
- Total carbon: ~20.7 tonnes CO2e

Common conversions:
- Concrete density: ~2,400 kg/m³
- 1 tonne ÷ 2,400 = 0.417 m³
```

**Outlier Explanation Tooltip:**
```
⚠️ This material is outside typical ranges

Why?
✓ Coal-intensive smelter grid (China)
✓ Higher primary aluminium content
✓ Verified in EPD: S-P-06970

This is ACCURATE and LEGITIMATE

When to use:
- If sourcing from China suppliers
- For global supply chain analysis
- If carbon intensity critical to decisions

Alternative:
- Look for European hydro-powered option
- Recycled aluminium (much lower carbon)
- Australian suppliers (if available)
```

---

## PART 6: MONTHLY REVIEW PROCESS

### 6.1 Team Responsibilities

**Automated Checks (Opus 4.5 - runs monthly):**
- ✅ Data integrity validation
- ✅ EPD registry verification
- ✅ NABERS range checking
- ✅ Unit consistency analysis
- ✅ Outlier detection
- ✅ Generate admin dashboard reports

**Manual Review Gates (Steven + 1 LCA Professional - weekly):**
- ⚠️ Verify flagged materials (high/critical priority)
- ⚠️ Investigate new outliers (why is this value different?)
- ⚠️ Approve source credibility tier assignments
- ⚠️ Document exceptional cases (coal grids, recycled content, etc.)
- ⚠️ Sign off on monthly validation report

**Customer Communication (Steven - Monthly):**
- 📊 Update Materials Database Status page
- 📝 Publish validation report (transparency = competitive advantage)
- 🔔 Flag any critical changes (material removed, sources updated, etc.)
- 💬 Blog post: "Here's what we validated this month - and why it matters"

---

## PART 7: RED FLAGS & ESCALATION

### 7.1 Situations Requiring Immediate Action

**🔴 STOP - Halt Platform Use**
1. Invalid EPD registration numbers found (>5 materials)
2. Data integrity failures (>1% materials with null required fields)
3. Impossible values (negative carbon factors)
4. Security incident (unauthorized data changes)

**⚠️ INVESTIGATE - Suspend Affected Materials**
1. Expired EPDs (>30 days overdue for update)
2. >30% materials in category outside NABERS range (no documentation)
3. Unit conversion errors discovered
4. Source data contradicts NABERS official ranges

**🟡 DOCUMENT - Flag for Transparency**
1. Legitimate outliers (coal grids, recycled content) - add tooltips
2. ICM industry averages (appropriate for hybrid LCA) - label clearly
3. Regional variants (provide context and alternatives)
4. Data gaps (manufacturer missing for asphalt) - note limitations

---

## PART 8: COMPETITIVE POSITIONING

### Why This Matters (vs OneClickLCA/eTool)

**OneClickLCA:**
- "Validated database" (vague, no methodology shown)
- Users trust it because it's named authoritative
- If errors found, credibility collapses

**eTool:**
- Large database, but transparency limited
- Users don't know which materials verified vs. estimated
- Updates infrequent

**CarbonConstruct (THIS FRAMEWORK):**
- 🔍 **Complete transparency:** Show exactly what's verified, what's estimated, why outliers exist
- 🔄 **Monthly validation reports:** Customers see you're actively checking data quality
- 🎯 **Confidence levels:** Users know which materials to trust for critical decisions
- 📊 **Built-in tooltips:** Education embedded in the calculator (customers learn carbon science)
- 🛠️ **Audit trail:** Every material has source, validation date, manual review notes

**Your message:**
> "We built CarbonConstruct by a builder for builders - which means we don't hide our data. Every carbon factor shows you where it comes from, why it might vary, and when we last verified it. OneClickLCA won't tell you why their mortar carbon is different than ours. We will."

---

## CHECKLIST: READY FOR CUSTOMER LAUNCH

- [ ] All 4,046 materials passed Layer 1-3 validation (data integrity, EPD registry, NABERS range)
- [ ] 0 critical issues remaining (no invalid EPDs, no null required fields)
- [ ] Steel outliers investigated (0.13 kgCO2e/t materials verified or removed)
- [ ] Unit consistency resolved (glass per-m² confirmed, asphalt conversions documented)
- [ ] Confidence levels assigned (green/yellow/orange/red) for all materials
- [ ] UI tooltips implemented (unit explanations, regional variations, outlier justification)
- [ ] Materials Database Status page live (/materials/status) with real-time stats
- [ ] Monthly validation process automated (Opus 4.5 scripts ready)
- [ ] Admin dashboard shows validation results + issues needing attention
- [ ] Customer-facing validation report prepared (monthly publication ready)
- [ ] Team trained on validation framework + escalation procedures
- [ ] Competitive messaging ready ("Built by a builder, verified for builders")

---

## NEXT STEPS FOR OPUS 4.5

**Priority 1 (This Week):**
1. Run full Layer 1-3 validation on 4,046 materials
2. Investigate those steel outliers (0.13 kgCO2e/t)
3. Resolve glass unit confusion (per-m² vs per-kg)
4. Verify WA Premix mortars are correctly categorized

**Priority 2 (Next Week):**
1. Assign confidence levels (green/yellow/orange) to all materials
2. Document regional variations with context
3. Implement UI tooltips with explanations
4. Create Materials Database Status page

**Priority 3 (Before Launch):**
1. Set up automated monthly validation pipeline
2. Create admin dashboard for validation results
3. Generate monthly transparency reports
4. Test customer experience (can they understand confidence levels?)

---

**This framework makes you bulletproof. You're not hiding behind "verified" - you're showing the work.**

**Your credibility is "we validate everything, show our work, and explain what we don't know."**
