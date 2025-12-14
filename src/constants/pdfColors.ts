/**
 * PDF Color Constants
 * 
 * These colors are derived from the design system CSS variables in src/index.css
 * and converted to hex values for use in PDF components (@react-pdf/renderer).
 * 
 * Note: Comments show approximate HSL values for reference. The hex values are the
 * source of truth for rendering. Small variations from CSS variables are expected
 * due to HSL-to-hex conversion and the need for specific shades in PDF contexts.
 * 
 * When updating colors, ensure they maintain WCAG AA contrast ratios for accessibility.
 */

// Base Colors
export const PDF_COLORS = {
  // Background & Foreground
  white: '#ffffff',
  background: '#e8eaed', // Approximately hsl(220, 9%, 90%)
  foreground: '#1f2328', // Approximately hsl(220, 15%, 12%)
  
  // Primary - Forest Green (derived from --primary: 156 55% 35%)
  primaryGreen: '#287856', // Approximately hsl(156, 55%, 32%)
  primaryGreenLight: '#2d9168', // Lighter variant
  primaryGreenDark: '#1e5a41', // Darker variant
  primaryGreenVeryLight: '#e6f4ed', // Very light tint for backgrounds
  
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
  success: '#22c55e', // Approximately hsl(142, 71%, 45%)
  successDark: '#16a34a',
  successVeryDark: '#15803d',
  successLight: '#4ade80',
  successVeryLight: '#86efac',
  successBackground: '#f0fdf4',
  successBackgroundAlt: '#e8f5e9',
  
  warning: '#f59e0b', // Approximately hsl(43, 96%, 50%)
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
  
  info: '#3b82f6', // Approximately hsl(217, 91%, 60%)
  infoDark: '#2563eb',
  infoVeryDark: '#1e40af',
  infoLight: '#60a5fa',
  infoVeryLight: '#93c5fd',
  infoBackground: '#eff6ff',
  infoBackgroundAlt: '#f0f5ff',
  
  // Chart & Data Visualization - derived from --chart-* variables
  chart: {
    coral: '#ef5350',      // chart-1: Coral red for scope 1
    amber: '#ffa726',      // chart-2: Amber for scope 2
    green: '#22c55e',      // chart-3: Green for scope 3
    blue: '#3b82f6',       // chart-4: Blue for data viz
    purple: '#ab47bc',     // chart-5: Purple for materials
    teal: '#26a69a',       // chart-6: Teal for compliance
    orange: '#ff7043',     // chart-7: Orange for construction
    pink: '#ec407a',       // chart-8: Pink for end-of-life
  },
  
  // Scope Colors - derived from --scope-* variables
  scope: {
    direct: '#ff7043',     // scope-1: Direct emissions
    energy: '#ffa726',     // scope-2: Energy emissions
    valueChain: '#287856', // scope-3: Value chain emissions
  },
  
  // LCA Colors - derived from --lca-* variables
  lca: {
    material: '#ab47bc',   // Materials phase
    transport: '#29b6f6',  // Transport phase
    construction: '#ff7043', // Construction phase
    endOfLife: '#ec407a',  // End-of-life phase
  },
  
  // Compliance Framework Colors
  compliance: {
    ncc: '#3b82f6',       // NCC framework
    gbca: '#22c55e',      // Green Building Council Australia
    nabers: '#26a69a',    // NABERS rating
    en15978: '#2563eb',   // EN 15978 standard
    climateActive: '#16a34a', // Climate Active
    isRating: '#9333ea',  // IS Rating
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
