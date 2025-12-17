# LinkedIn Carousel Design Specification
## "The Silent Transfer" - 10-Slide Carousel

---

## Canvas Setup

| Property | Value |
|----------|-------|
| **Dimensions** | 1080 x 1080 px (1:1 square) |
| **Resolution** | 300 DPI for print-quality |
| **File Format** | PNG or PDF for upload |
| **Color Mode** | RGB |

---

## Color Palette

### Primary Colors
| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Deep Navy** | `#0f172a` | 15, 23, 42 | Background (dark slides) |
| **Slate** | `#1e293b` | 30, 41, 59 | Card backgrounds |
| **White** | `#ffffff` | 255, 255, 255 | Primary text on dark |

### Accent Colors
| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Amber Warning** | `#d97706` | 217, 119, 6 | Key statistics, warnings |
| **Red Alert** | `#dc2626` | 220, 38, 38 | Penalties, negative impacts |
| **Emerald Success** | `#10b981` | 16, 185, 129 | Timeline start, positive CTAs |
| **Primary Blue** | `#3b82f6` | 59, 130, 246 | Links, subtle accents |

### Gradient Backgrounds
```
Cover Slide: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #292524 100%)
CTA Slide: linear-gradient(135deg, #0f172a 0%, #064e3b 100%)
```

---

## Typography

### Primary Font: Inter (Google Fonts)
Free download: https://fonts.google.com/specimen/Inter

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| **Slide Title** | Inter | Bold (700) | 72px | 1.1 |
| **Big Stat Number** | Inter | Extra Bold (800) | 144px | 1.0 |
| **Body Text** | Inter | Medium (500) | 36px | 1.4 |
| **Small Text** | Inter | Regular (400) | 28px | 1.5 |
| **Caption/CTA** | Inter | Semi Bold (600) | 32px | 1.3 |

### Alternative Fonts (if Inter unavailable)
- **Headings**: Poppins, Montserrat, or SF Pro Display
- **Body**: Open Sans, Roboto, or Nunito Sans

---

## Slide-by-Slide Specifications

### SLIDE 1: Cover
**Background**: Navy gradient with subtle grid pattern  
**Layout**: Centered text stack

```
┌─────────────────────────────┐
│                             │
│     ⚠️ (Amber icon)         │
│                             │
│    THE SILENT TRANSFER      │  ← 72px Bold, White
│                             │
│    How Scope 3 Mandates     │  ← 36px Medium, White/70%
│    Are Locking Subcontractors│
│    Out of Tenders           │
│                             │
│    Swipe to learn →         │  ← 28px, Amber
│                             │
│    [CarbonConstruct logo]   │  ← Bottom right corner
└─────────────────────────────┘
```

---

### SLIDE 2: Hook Stat
**Background**: Solid navy `#0f172a`  
**Layout**: Centered with large stat

```
┌─────────────────────────────┐
│                             │
│                             │
│         80-90%              │  ← 144px Extra Bold, Amber
│                             │
│    of a builder's carbon    │  ← 36px Medium, White
│    footprint is Scope 3     │
│                             │
│    ─────────────────────    │  ← Amber line divider
│                             │
│    That's YOUR materials.   │  ← 32px Semi Bold, White/60%
│    YOUR supply chain.       │
│                             │
└─────────────────────────────┘
```

---

### SLIDE 3: The Problem
**Background**: Slate `#1e293b`  
**Layout**: Left-aligned text

```
┌─────────────────────────────┐
│                             │
│  ASRS mandates force        │  ← 48px Bold, White
│  builders to report         │
│  Scope 3                    │
│                             │
│  ─────────────────────      │  ← White/20% divider
│                             │
│  They can't report what     │  ← 36px Medium, White/70%
│  they can't measure.        │
│                             │
│  So they need               │  ← 36px Medium, White/70%
│  YOUR data.                 │  ← 48px Bold, Amber
│                             │
└─────────────────────────────┘
```

---

### SLIDE 4: Penalty
**Background**: Navy with red accent glow  
**Layout**: Centered stat focus

```
┌─────────────────────────────┐
│                             │
│      No EPD data?           │  ← 36px Medium, White/70%
│                             │
│        20-30%               │  ← 144px Extra Bold, Red
│                             │
│      penalty applied        │  ← 36px Medium, White
│                             │
│  ─────────────────────      │
│                             │
│  "Conservative defaults"    │  ← 28px Regular, White/50%
│  make your materials look   │
│  dirtier than reality       │
│                             │
└─────────────────────────────┘
```

---

### SLIDE 5: Shadow Price
**Background**: Navy with amber accent  
**Layout**: Centered with location callout

```
┌─────────────────────────────┐
│                             │
│    NSW & VIC apply          │  ← 32px Medium, White/70%
│                             │
│      $123/tonne             │  ← 120px Extra Bold, Amber
│                             │
│    shadow carbon price      │  ← 36px Medium, White
│                             │
│  ─────────────────────      │
│                             │
│  Low-carbon suppliers win   │  ← 28px Regular, White/50%
│  tenders even at higher     │
│  prices                     │
│                             │
└─────────────────────────────┘
```

---

### SLIDE 6: The Cascade
**Background**: Slate with arrow graphics  
**Layout**: Vertical list with arrows

```
┌─────────────────────────────┐
│                             │
│    The Cascade Effect:      │  ← 48px Bold, White
│                             │
│    → Missing EPD data       │  ← 32px Medium, White/70%
│              ↓              │
│    → Inflated carbon score  │  ← 32px Medium, White/70%
│              ↓              │
│    → Client loses Green     │  ← 32px Medium, White/70%
│      Star points            │
│              ↓              │
│    → Government tender      │  ← 32px Medium, Amber
│      fails                  │
│              ↓              │
│    → You lose the next call │  ← 32px Bold, Red
│                             │
└─────────────────────────────┘
```

---

### SLIDE 7: The Firewall
**Background**: Dark with red border accent  
**Layout**: Centered with comparison list

```
┌─────────────────────────────┐
│                             │
│   THE PROCUREMENT           │  ← 48px Bold, White
│   FIREWALL                  │
│                             │
│   As formidable as:         │  ← 32px Medium, White/60%
│                             │
│   ❌ Financial insolvency   │  ← 36px Medium, White
│                             │
│   ❌ Safety non-compliance  │  ← 36px Medium, White
│                             │
│   ❌ Missing insurance      │  ← 36px Medium, White
│                             │
│   [Red border around slide] │
└─────────────────────────────┘
```

---

### SLIDE 8: The Truth
**Background**: Navy gradient  
**Layout**: Centered dramatic text

```
┌─────────────────────────────┐
│                             │
│                             │
│   The legislation doesn't   │  ← 40px Bold, White
│   name subcontractors.      │
│                             │
│   It doesn't need to.       │  ← 56px Extra Bold, Amber
│                             │
│   ─────────────────────     │
│                             │
│   The burden flows through  │  ← 32px Medium, White/60%
│   procurement.              │
│                             │
│                             │
└─────────────────────────────┘
```

---

### SLIDE 9: Timeline
**Background**: Slate with colored timeline  
**Layout**: Vertical timeline

```
┌─────────────────────────────┐
│                             │
│        TIMELINE             │  ← 48px Bold, White
│                             │
│   ●──── 2024                │  ← Emerald dot
│   │     ASRS mandatory      │  ← 28px, White/70%
│   │                         │
│   ●──── 2025                │  ← Amber dot
│   │     Threshold drops     │
│   │                         │
│   ●──── 2026                │  ← Orange dot
│   │     Universal standard  │
│   │                         │
│   ●──── 2027+               │  ← Red dot
│         Full enforcement    │
│                             │
└─────────────────────────────┘
```

**Timeline Colors**:
- 2024: Emerald `#10b981`
- 2025: Amber `#d97706`
- 2026: Orange `#ea580c`
- 2027+: Red `#dc2626`

---

### SLIDE 10: CTA
**Background**: Navy to emerald gradient  
**Layout**: Centered with strong CTA

```
┌─────────────────────────────┐
│                             │
│   The question isn't        │  ← 40px Bold, White
│   IF this affects you.      │
│                             │
│   It's WHEN.                │  ← 72px Extra Bold, Emerald
│                             │
│   ─────────────────────     │
│                             │
│   📄 Full analysis in       │  ← 32px Medium, White/70%
│      comments               │
│                             │
│   carbonconstruct.com.au    │  ← 28px Semi Bold, Emerald
│   /resources                │
│                             │
│   [CarbonConstruct logo]    │
└─────────────────────────────┘
```

---

## Design Elements

### Icons to Use
| Icon | Usage | Source |
|------|-------|--------|
| ⚠️ Warning Triangle | Cover, alerts | Lucide: `alert-triangle` |
| ❌ Cross | Firewall comparisons | Text character |
| → Arrow | Flow/cascade | Text character |
| 📄 Document | CTA reference | Emoji |
| ● Circle | Timeline dots | Shape tool |

### Visual Effects
- **Subtle grain/noise overlay**: 2-5% opacity for texture
- **Vignette**: Slight darkening at edges
- **Glow effects**: Behind key stats (10-20px blur, 20% opacity)

### Logo Placement
- Position: Bottom-right corner
- Size: 120px width max
- Opacity: 80-100%
- Include on slides: 1, 10

---

## Export Settings

### For LinkedIn Upload
- Format: PNG
- Resolution: 1080x1080px
- Quality: Maximum/Best
- Color Profile: sRGB

### For Print/High Quality
- Format: PDF
- Resolution: 300 DPI
- Include bleed: No (digital only)

---

## Canva Quick Setup

1. **Create Design** → Custom Size → 1080 x 1080 px
2. **Brand Kit** (if Canva Pro):
   - Add colors: `#0f172a`, `#d97706`, `#dc2626`, `#10b981`
   - Upload font: Inter (or use Canva's version)
3. **Create 10 pages** for each slide
4. **Apply master background** to all slides
5. **Add consistent logo placement**

### Canva Template Search Terms
If looking for inspiration:
- "LinkedIn carousel dark professional"
- "Data presentation minimalist"
- "Business statistics infographic"

---

## Accessibility Notes

- Ensure text contrast ratio ≥ 4.5:1
- Don't rely solely on color to convey meaning
- Keep text size ≥ 28px for readability on mobile
- Test on both light and dark mode devices

---

## File Naming Convention

```
silent-transfer-carousel-01-cover.png
silent-transfer-carousel-02-hook-stat.png
silent-transfer-carousel-03-problem.png
silent-transfer-carousel-04-penalty.png
silent-transfer-carousel-05-shadow-price.png
silent-transfer-carousel-06-cascade.png
silent-transfer-carousel-07-firewall.png
silent-transfer-carousel-08-truth.png
silent-transfer-carousel-09-timeline.png
silent-transfer-carousel-10-cta.png
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Created by**: CarbonConstruct Marketing
