# EC3 Integration Guide

## Overview

CarbonConstruct integrates with the [EC3 (Embodied Carbon in Construction Calculator)](https://buildingtransparency.org/ec3) database from Building Transparency, providing access to thousands of Environmental Product Declarations (EPDs) from manufacturers worldwide.

## Data Licensing

**IMPORTANT**: EC3 data is licensed under CC BY 4.0 with mandatory attribution.

Per the licensing requirements:
- ✅ Materials can be searched and displayed with attribution
- ✅ Users can copy EC3 data to their calculations
- ❌ EC3 data **cannot** be stored in our database
- ❌ Bulk redistribution is not permitted

All EC3 data displayed in CarbonConstruct includes the required "Powered by EC3" attribution badge.

## Setup Instructions

### 1. Get an EC3 API Key

1. Create an account at [buildingtransparency.org](https://buildingtransparency.org)
2. Log in to EC3
3. Go to **Settings** → **API & Integrations**
4. Click **Create New API Key**
5. Copy your API key

### 2. Add API Key to CarbonConstruct

In the Lovable editor:
1. Open the chat panel
2. Ask: "Add my EC3 API key"
3. Enter your API key in the secure form that appears
4. The key will be stored as `EC3_API_KEY` in project secrets

### 3. Using EC3 in the Calculator

1. Open the Calculator page
2. In the material search section, toggle from "Local DB" to "EC3 Global"
3. Search for materials by name, category, or EPD number
4. Click "Add" to copy a material to your calculation
5. Set the quantity to calculate emissions

## Rate Limits

EC3 has default throttling rules:

| Period | Token Limit |
|--------|-------------|
| Per Minute | 45 |
| Per Hour | 400 |
| Per Day | 2,000 |
| Per Month | 10,000 |

If you need higher limits, contact [support@buildingtransparency.org](mailto:support@buildingtransparency.org).

## Technical Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │   Edge Function  │     │                 │
│   Calculator    │────▶│  search-ec3-    │────▶│   EC3 API       │
│   Component     │     │   materials      │     │   (External)    │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Files

| File | Purpose |
|------|---------|
| `supabase/functions/search-ec3-materials/index.ts` | Edge function proxy to EC3 API |
| `src/lib/ec3-types.ts` | TypeScript type definitions |
| `src/components/calculator/EC3SearchPanel.tsx` | Search UI component |
| `src/components/calculator/EC3Attribution.tsx` | Required attribution badge |
| `src/components/calculator/EC3DatabaseToggle.tsx` | Local/EC3 toggle switch |
| `src/hooks/useEC3Integration.ts` | Integration state management |

## Troubleshooting

### "EC3 API key not configured"

The `EC3_API_KEY` secret hasn't been added. Follow the setup instructions above.

### "EC3 rate limit exceeded"

You've hit EC3's API limits. Wait a few minutes and try again, or contact EC3 for higher limits.

### "Invalid authentication"

Your EC3 API key may be expired or invalid. Generate a new key from your EC3 account settings.

### No results found

- Check your search spelling
- Try broader search terms
- Some specialized materials may not be in EC3's database

## Attribution Requirements

When displaying EC3 data, always show:

1. **Badge**: The "Powered by EC3" badge (included automatically)
2. **Link**: Link back to the original EPD in EC3 when available
3. **Footer**: Attribution footer on any pages showing EC3 data

These are handled automatically by the `EC3Attribution` component.

## Contact

- EC3 Support: [support@buildingtransparency.org](mailto:support@buildingtransparency.org)
- EC3 Documentation: [docs.buildingtransparency.org](https://docs.buildingtransparency.org)
- CarbonConstruct: [support@carbonconstruct.com.au](mailto:support@carbonconstruct.com.au)

---

© 2025 CarbonConstruct Pty Ltd. EC3 is a product of Building Transparency.
