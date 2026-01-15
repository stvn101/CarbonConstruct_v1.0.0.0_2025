/**
 * Excel Parser Utility
 * Replaces xlsx library with exceljs for better ESM compatibility
 */
import ExcelJS from 'exceljs';

export interface ParsedSheet {
  name: string;
  csv: string;
}

export interface ParsedWorkbook {
  sheets: ParsedSheet[];
  sheetNames: string[];
}

/**
 * Parse an Excel file (xlsx/xls) and convert all sheets to CSV format
 */
export async function parseExcelToCSV(arrayBuffer: ArrayBuffer): Promise<ParsedWorkbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  
  const sheets: ParsedSheet[] = [];
  const sheetNames: string[] = [];
  
  workbook.eachSheet((worksheet) => {
    sheetNames.push(worksheet.name);
    
    const rows: string[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const values = row.values as (string | number | boolean | Date | null | undefined)[];
      const cellValues = values.slice(1).map(cell => {
        if (cell === null || cell === undefined) return '';
        if (cell instanceof Date) return cell.toISOString();
        if (typeof cell === 'object' && 'text' in cell) return String((cell as { text: string }).text);
        if (typeof cell === 'object' && 'result' in cell) return String((cell as { result: unknown }).result);
        return String(cell);
      });
      
      const csvRow = cellValues.map(val => {
        const strVal = String(val);
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      }).join(',');
      
      rows.push(csvRow);
    });
    
    sheets.push({
      name: worksheet.name,
      csv: rows.join('\n')
    });
  });
  
  return { sheets, sheetNames };
}

/**
 * Parse Excel file and return text content
 */
export async function parseExcelToText(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await parseExcelToCSV(arrayBuffer);
  return result.sheets[0]?.csv || '';
}

/**
 * Parse just the first sheet from an Excel file
 */
export async function parseExcelFirstSheet(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await parseExcelToCSV(arrayBuffer);
  return result.sheets[0]?.csv || '';
}

/**
 * Get sheet names from an Excel file
 */
export async function getExcelSheetNames(arrayBuffer: ArrayBuffer): Promise<string[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  
  const names: string[] = [];
  workbook.eachSheet((worksheet) => {
    names.push(worksheet.name);
  });
  
  return names;
}
