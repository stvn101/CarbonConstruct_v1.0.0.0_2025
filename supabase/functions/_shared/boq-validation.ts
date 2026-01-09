/**
 * Server-side BOQ Carbon Factor Validation
 * Defense-in-depth validation for parse-boq edge function
 */

const CARBON_FACTOR_PATTERNS = [
  'carbon factor', 'carbon_factor', 'kgco2e', 'kg co2e', 'ef_total',
  'emission factor', 'emission_factor', 'co2e', 'embodied carbon', 'gwp'
];

export function validateCarbonFactorsServer(
  text: string
): { error: string; errorCode: string } | null {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  const headerRow = lines[0].toLowerCase();
  const hasFactorColumn = CARBON_FACTOR_PATTERNS.some(p => headerRow.includes(p));
  if (!hasFactorColumn) return null;

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const factorColIndex = headers.findIndex(h => 
    CARBON_FACTOR_PATTERNS.some(p => h.includes(p))
  );
  if (factorColIndex === -1) return null;

  let emptyCount = 0;
  const negativeRows: number[] = [];
  const dataRowCount = lines.length - 1;

  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',').map(c => c.trim());
    if (columns.length <= factorColIndex) { emptyCount++; continue; }
    
    const val = columns[factorColIndex].replace(/[$£€¥,\s]/g, '');
    if (val === '' || val === '-') { emptyCount++; continue; }
    
    const num = parseFloat(val);
    if (!isNaN(num) && num < 0) negativeRows.push(i + 1);
  }

  if (negativeRows.length > 0) {
    return {
      error: `Carbon factors cannot be negative. Found ${negativeRows.length} negative value(s) at rows: ${negativeRows.slice(0, 3).join(', ')}${negativeRows.length > 3 ? '...' : ''}`,
      errorCode: 'BOQ_NEGATIVE_FACTOR'
    };
  }

  if (emptyCount === dataRowCount) {
    return {
      error: 'All carbon factor values are empty. Please provide data or remove the carbon factor column.',
      errorCode: 'BOQ_ALL_FACTORS_EMPTY'
    };
  }

  return null;
}
