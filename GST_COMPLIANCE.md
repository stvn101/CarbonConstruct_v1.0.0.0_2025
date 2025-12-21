# GST Compliance Documentation

## CarbonConstruct Australian Tax Compliance

**Version:** 1.0  
**Last Updated:** December 2025  
**ABN:** 67 652 069 139

---

## Overview

This document outlines CarbonConstruct's compliance with Australian Goods and Services Tax (GST) requirements as mandated by the Australian Taxation Office (ATO) under the *A New Tax System (Goods and Services Tax) Act 1999*.

---

## GST Registration Status

- **GST Registered:** Yes
- **ABN Display:** Footer of all pages
- **Tax Invoice Capability:** Automated via Stripe webhook integration

---

## GST Calculation Methodology

### 1. Calculation Formula

CarbonConstruct uses the **GST-inclusive method** for calculating GST components:

```
GST Amount = Total Amount ÷ 11
Net Amount = Total Amount - GST Amount
```

### 2. Precision Requirements

All monetary calculations use **Decimal.js** library to ensure:

- **No floating-point errors** in currency calculations
- **Cent-level precision** (2 decimal places)
- **Deterministic rounding** per ATO guidelines

### 3. Rounding Rules

Per ATO Goods and Services Tax Ruling GSTR 2001/1:

```typescript
// GST Rounding: Round to nearest cent
const gst = gross.dividedBy(11).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
```

| Scenario | Calculation | Result |
|----------|-------------|--------|
| $110.00 total | $110.00 ÷ 11 | $10.00 GST |
| $115.50 total | $115.50 ÷ 11 | $10.50 GST |
| $115.55 total | $115.55 ÷ 11 | $10.505 → $10.51 GST |

---

## Tax Invoice Requirements

### Mandatory Fields (Tax Invoices over $82.50)

Per Division 29 of the GST Act, our tax invoices include:

1. **Identity:** "TAX INVOICE" header
2. **Supplier Details:**
   - Business name: CarbonConstruct Pty Ltd
   - ABN: 67 652 069 139
   - Address: [Australian address]
3. **Invoice Details:**
   - Invoice number (unique)
   - Issue date
   - Description of services
4. **Amounts:**
   - Total amount (GST-inclusive)
   - GST amount (shown separately)
   - Net amount (GST-exclusive)
5. **Recipient Details:**
   - Customer name/business name
   - Customer ABN (if B2B over $1,000)

### Implementation

Tax invoices are generated via the `AustralianTaxInvoice` component using data from the `payment_tax_records` table:

```typescript
interface TaxInvoiceData {
  stripe_invoice_id: string;
  gross_amount_cents: number;
  gst_amount_cents: number;
  net_amount_cents: number;
  currency: string;
  invoice_date: string;
  user_id: string;
}
```

---

## Record Keeping Requirements

### Retention Period

Per the *Taxation Administration Act 1953*, all tax records must be retained for **5 years** from:
- The date the record was prepared or obtained; or
- The date the transaction was completed

### Data Stored

The `payment_tax_records` table stores:

| Field | Description | Purpose |
|-------|-------------|---------|
| `stripe_invoice_id` | Unique invoice reference | ATO audit trail |
| `gross_amount_cents` | Total amount charged | GST base calculation |
| `gst_amount_cents` | GST component | BAS reporting |
| `net_amount_cents` | GST-exclusive amount | Net revenue tracking |
| `invoice_date` | Date of supply | Tax period allocation |
| `metadata` | Additional transaction data | Audit support |

### Data Sovereignty

All payment records are stored in Supabase (ap-southeast-2 Sydney region) per Australian data residency requirements.

---

## BAS Reporting Support

### Quarterly BAS Fields

CarbonConstruct's tax records support the following BAS labels:

| BAS Label | Description | Data Source |
|-----------|-------------|-------------|
| G1 | Total sales (incl. GST) | SUM(gross_amount_cents) |
| G2 | Export sales | N/A (domestic only) |
| G10 | Capital purchases | N/A |
| G11 | Non-capital purchases | N/A |
| 1A | GST on sales | SUM(gst_amount_cents) |

### Export Functionality

Tax records can be exported for BAS preparation via:
- Admin dashboard CSV export
- API endpoint for accounting software integration

---

## Stripe Integration

### Webhook Processing

The `stripe-webhook` edge function processes `invoice.paid` events:

1. Extracts payment details from Stripe invoice
2. Calculates GST using Decimal.js (if not provided by Stripe)
3. Inserts record into `payment_tax_records`
4. Associates with user account for invoice retrieval

### Currency Handling

- **Primary Currency:** AUD
- **GST Calculation:** Only applied to AUD transactions
- **Multi-currency:** Non-AUD transactions store raw amounts without GST breakdown

---

## Compliance Checklist

### Monthly

- [ ] Verify webhook processing for all paid invoices
- [ ] Reconcile Stripe dashboard with `payment_tax_records`
- [ ] Check for failed tax record insertions in error logs

### Quarterly (BAS Period)

- [ ] Export tax records for BAS preparation
- [ ] Verify GST totals match Stripe reporting
- [ ] Review any manual adjustments required

### Annually

- [ ] Update ABN display across all pages
- [ ] Review GST rate (currently 10%)
- [ ] Audit 5-year record retention compliance
- [ ] Update tax invoice template if ATO requirements change

---

## Error Handling

### Failed Tax Record Insertion

If a tax record fails to insert:
1. Error is logged to `error_logs` table
2. Subscription update proceeds (non-blocking)
3. Manual reconciliation flagged for review

### Recovery Process

```sql
-- Find invoices without tax records
SELECT si.stripe_invoice_id
FROM user_subscriptions us
LEFT JOIN payment_tax_records ptr ON us.stripe_subscription_id LIKE '%' || ptr.stripe_invoice_id || '%'
WHERE ptr.id IS NULL;
```

---

## References

- [ATO GST Registration](https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/registering-for-gst)
- [GSTR 2001/1 - Rounding](https://www.ato.gov.au/law/view/document?docid=GST/GSTR20011/NAT/ATO/00001)
- [Tax Invoice Requirements](https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/issuing-tax-invoices)
- [Record Keeping Requirements](https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/record-keeping-for-business)

---

## Contact

For GST compliance queries:
- **Finance Team:** finance@carbonconstruct.com.au
- **ATO Liaison:** [Designated contact]
