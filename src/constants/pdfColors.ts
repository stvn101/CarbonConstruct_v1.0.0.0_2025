/**
 * PDF Color Constants
 * 
 * These colors are derived from the design system CSS variables in src/index.css
 * and converted to hex values for use in PDF components (@react-pdf/renderer).
 * 
 * When updating colors, ensure they align with the HSL values defined in index.css
 * and maintain WCAG AA contrast ratios for accessibility.
 */

// Base Colors
export const PDF_COLORS = {
  // Background & Foreground
  white: '#ffffff',
  background: '#e8eaed', // hsl(220 15% 92%)
  foreground: '#1f2328', // hsl(220 15% 12%)
  
  // Primary - Forest Green (from --primary: 156 55% 35%)
  primaryGreen: '#287856',
  primaryGreenLight: '#2d9168',
  primaryGreenDark: '#1e5a41',
  primaryGreenVeryLight: '#e6f4ed',
  
  // Secondary - Carbon Blue-Grey
  secondaryBlue: '#596d87',
  secondaryBlueDark: '#3b5166',
  
  // Text Colors
  textDark: '#1f2328',
  textMedium: '#3b4248',
  textGray: '#666666',
  textLightGray: '#888888',
  textMuted: '#999999',
  
  // Border Colors
  borderLight: '#e5e7eb',
  borderMedium: '#d1d5db',
  borderDark: '#cccccc',
  borderGray: '#e0e0e0',
  
  // Background Shades
  backgroundLightGray: '#f8f9fa',
  backgroundMediumGray: '#f3f4f6',
  backgroundDarkGray: '#f0f0f0',
  backgroundVeryLight: '#fafafa',
  
  // Status Colors - derived from CSS variables
  success: '#22c55e', // hsl(142 70% 45%)
  successDark: '#16a34a',
  successVeryDark: '#15803d',
  successLight: '#4ade80',
  successVeryLight: '#86efac',
  successBackground: '#f0fdf4',
  successBackgroundAlt: '#e8f5e9',
  
  warning: '#f59e0b', // hsl(48 95% 55%)
  warningDark: '#d97706',
  warningVeryDark: '#b45309',
  warningAlt: '#ff9800',
  warningBackground: '#fef3c7',
  warningBackgroundAlt: '#fff3e0',
  
  error: '#dc2626',
  errorDark: '#b91c1c',
  errorVeryDark: '#991b1b',
  errorBackground: '#fef2f2',
  errorLight: '#fca5a5',
  
  info: '#3b82f6', // hsl(210 90% 55%)
  infoDark: '#2563eb',
  infoVeryDark: '#1e40af',
  infoLight: '#60a5fa',
  infoVeryLight: '#93c5fd',
  infoBackground: '#eff6ff',
  infoBackgroundAlt: '#f0f5ff',
  
  // Chart & Data Visualization - from --chart-* variables
  chart: {
    coral: '#ef5350',      // chart-1: hsl(15 90% 58%)
    amber: '#ffa726',      // chart-2: hsl(48 95% 55%)
    green: '#22c55e',      // chart-3: hsl(142 70% 45%)
    blue: '#3b82f6',       // chart-4: hsl(210 90% 55%)
    purple: '#ab47bc',     // chart-5: hsl(280 75% 60%)
    teal: '#26a69a',       // chart-6: hsl(180 80% 48%)
    orange: '#ff7043',     // chart-7: hsl(30 95% 58%)
    pink: '#ec407a',       // chart-8: hsl(340 80% 60%)
  },
  
  // Scope Colors - from --scope-* variables
  scope: {
    direct: '#ff7043',     // scope-1: hsl(15 90% 58%) - direct emissions
    energy: '#ffa726',     // scope-2: hsl(48 95% 55%) - energy
    valueChain: '#287856', // scope-3: hsl(156 60% 42%) - value chain
  },
  
  // LCA Colors - from --lca-* variables
  lca: {
    material: '#ab47bc',   // hsl(280 75% 60%)
    transport: '#29b6f6',  // hsl(200 90% 55%)
    construction: '#ff7043', // hsl(30 95% 58%)
    endOfLife: '#ec407a',  // hsl(340 80% 60%)
  },
  
  // Compliance Framework Colors
  compliance: {
    ncc: '#3b82f6',       // hsl(210 90% 55%)
    gbca: '#22c55e',      // hsl(142 75% 48%)
    nabers: '#26a69a',    // hsl(180 80% 48%)
    en15978: '#2563eb',   // hsl(220 85% 55%)
    climateActive: '#16a34a', // hsl(152 80% 45%)
    isRating: '#9333ea',  // hsl(270 70% 55%)
  },
  
  // Specific Use Case Colors
  watermark: '#e8e8e8',
  
  // Table Colors
  tableHeaderBg: '#f3f4f6',
  tableRowAltBg: '#f8f9fa',
  tableRowHighlight: '#e8f5e9',
  tableRowInfo: '#e3f2fd',
  
  // Alert Box Colors  
  alertInfo: {
    background: '#e3f2fd',
    border: '#90caf9',
    text: '#1565c0',
  },
  alertWarning: {
    background: '#fff3e0',
    border: '#ff9800',
    text: '#e65100',
    textDark: '#bf360c',
  },
  alertSuccess: {
    background: '#e8f5e9',
    border: '#4caf50',
    text: '#2e7d32',
    textDark: '#1b5e20',
  },
  alertError: {
    background: '#fef2f2',
    border: '#fca5a5',
    text: '#dc2626',
  },
} as const;

// Type-safe color access
export type PDFColorKey = keyof typeof PDF_COLORS;
