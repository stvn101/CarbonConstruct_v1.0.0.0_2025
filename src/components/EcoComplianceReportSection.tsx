/**
 * ECO Platform Compliance Report Section
 * For inclusion in PDF reports - displays all ECO Platform transparency requirements
 */

import { EcoPlatformComplianceReport } from '@/lib/eco-platform-types';
import { CheckCircle, AlertCircle, AlertTriangle, Shield } from 'lucide-react';

interface EcoComplianceReportSectionProps {
  report: EcoPlatformComplianceReport;
}

export function EcoComplianceReportSection({ report }: EcoComplianceReportSectionProps) {
  return (
    <div className="eco-compliance-report space-y-6 print:text-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">ECO Platform Compliance Declaration</h2>
            <p className="text-sm text-muted-foreground">
              LCA Calculation Rules V2.0 (December 2024)
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            report.complianceValidation.isFullyCompliant ? 'text-emerald-600' : 'text-destructive'
          }`}>
            {report.complianceValidation.complianceScore}%
          </div>
          <div className="text-xs text-muted-foreground">Compliance Score</div>
        </div>
      </div>

      {/* Standards Compliance */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Standards Compliance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'EN 15804+A2', compliant: report.standardsCompliance.en15804A2 },
            { name: 'ECO Platform V2.0', compliant: report.standardsCompliance.ecoPlatformV2 },
            { name: 'ISO 14025', compliant: report.standardsCompliance.iso14025 },
            { name: 'ISO 21930', compliant: report.standardsCompliance.iso21930 },
          ].map((standard) => (
            <div 
              key={standard.name}
              className={`p-3 rounded-lg border ${
                standard.compliant 
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' 
                  : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {standard.compliant ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                <span className="text-sm font-medium">{standard.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Energy Transparency (Section 2.5.3) */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Energy Transparency (§2.5)</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 font-medium">Electricity Modelling Approach</td>
                <td className="py-2 text-right capitalize">
                  {report.energyTransparency.electricityModellingApproach}
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 font-medium">Electricity % of A1-A3 Energy</td>
                <td className="py-2 text-right">
                  {report.energyTransparency.electricityPercentageOfA1A3.toFixed(1)}%
                </td>
              </tr>
              {report.energyTransparency.electricityGwpKgCO2ePerKwh !== null && (
                <tr className="border-b border-border">
                  <td className="py-2 font-medium">Electricity GWP (kgCO2e/kWh)</td>
                  <td className="py-2 text-right">
                    {report.energyTransparency.electricityGwpKgCO2ePerKwh.toFixed(3)}
                  </td>
                </tr>
              )}
              <tr className="border-b border-border">
                <td className="py-2 font-medium">Gas % of A1-A3 Energy</td>
                <td className="py-2 text-right">
                  {report.energyTransparency.gasPercentageOfA1A3.toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Contractual Instruments Used</td>
                <td className="py-2 text-right">
                  {report.energyTransparency.contractualInstrumentsUsed ? 'Yes' : 'No'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Characterisation Factors (Section 2.9) */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Characterisation Factors (§2.9)</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 font-medium">Version</td>
                <td className="py-2 text-right">{report.characterisationFactors.version}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Source</td>
                <td className="py-2 text-right">{report.characterisationFactors.source}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Allocation Statement (Section 2.6) */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Allocation Statement (§2.6)</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 font-medium">Co-Products Present</td>
                <td className="py-2 text-right">
                  {report.allocationStatement.coProductsPresent ? 'Yes' : 'No'}
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 font-medium">Allocation Method</td>
                <td className="py-2 text-right">{report.allocationStatement.allocationMethodUsed}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Economic Allocation for Slag/Fly Ash</td>
                <td className="py-2 text-right flex items-center justify-end gap-1">
                  {report.allocationStatement.economicAllocationForSlagFlyAsh ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Compliant</span>
                    </>
                  ) : report.allocationStatement.coProductsPresent ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span>Non-compliant</span>
                    </>
                  ) : (
                    <span>N/A</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Data Quality Summary (Section 2.7) */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Data Quality Summary (§2.7)</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 font-medium">Overall Quality Rating</td>
                <td className="py-2 text-right">
                  <span className={`font-bold ${
                    ['A', 'B'].includes(report.dataQuality.overallRating) 
                      ? 'text-emerald-600' 
                      : report.dataQuality.overallRating === 'C'
                      ? 'text-amber-600'
                      : 'text-destructive'
                  }`}>
                    {report.dataQuality.overallRating}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 font-medium">Temporal Coverage</td>
                <td className="py-2 text-right">{report.dataQuality.temporalCoverage}</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Geographical Coverage</td>
                <td className="py-2 text-right">{report.dataQuality.geographicalCoverage}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Manufacturing Locations (Section 2.12) */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Manufacturing Locations (§2.12)</h3>
        {report.manufacturingLocations.length > 0 ? (
          <div className="bg-muted/50 rounded-lg p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium">Country</th>
                  <th className="py-2 text-left font-medium">City</th>
                  <th className="py-2 text-left font-medium">State</th>
                </tr>
              </thead>
              <tbody>
                {report.manufacturingLocations.map((loc, i) => (
                  <tr key={i} className={i < report.manufacturingLocations.length - 1 ? 'border-b border-border' : ''}>
                    <td className="py-2">{loc.country}</td>
                    <td className="py-2">{loc.city}</td>
                    <td className="py-2">{loc.state || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Manufacturing location data not available at country/city level
            </p>
          </div>
        )}
      </section>

      {/* Biogenic Carbon (Section 2.11) */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Biogenic Carbon (§2.11)</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 font-medium">Total Biogenic Carbon (kg C)</td>
                <td className="py-2 text-right">
                  {report.biogenicCarbon.totalBiogenicCarbonKgC.toFixed(2)}
                </td>
              </tr>
              {report.biogenicCarbon.biogenicCarbonKgCO2e !== null && (
                <tr className="border-b border-border">
                  <td className="py-2 font-medium">Biogenic Carbon (kg CO2-e)</td>
                  <td className="py-2 text-right">
                    {report.biogenicCarbon.biogenicCarbonKgCO2e.toFixed(2)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-2 font-medium">Packaging Biogenic Carbon Balanced</td>
                <td className="py-2 text-right">
                  {report.biogenicCarbon.packagingBiogenicBalanced ? 'Yes' : 'No'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Compliance Validation */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Compliance Validation</h3>
        {report.complianceValidation.isFullyCompliant ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Fully Compliant with ECO Platform LCA Calculation Rules V2.0</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {report.complianceValidation.nonCompliantItems.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Non-Compliant Items
                </h4>
                <ul className="space-y-1">
                  {report.complianceValidation.nonCompliantItems.map((item, i) => (
                    <li key={i} className="text-sm text-destructive/80">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.complianceValidation.warnings.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warnings
                </h4>
                <ul className="space-y-1">
                  {report.complianceValidation.warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-amber-600 dark:text-amber-400/80">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="text-xs text-muted-foreground border-t border-border pt-4">
        <p>Report generated: {new Date(report.generatedAt).toLocaleString()}</p>
        <p>Project: {report.projectName} (ID: {report.projectId})</p>
        <p className="mt-2">
          This declaration is prepared in accordance with ECO Platform LCA Calculation Rules V2.0 
          (December 2024) and EN 15804:2012+A2:2019 standards.
        </p>
      </div>
    </div>
  );
}

/**
 * Print-friendly version for PDF generation
 */
export function EcoComplianceReportSectionPrint({ report }: EcoComplianceReportSectionProps) {
  return (
    <div className="eco-compliance-print" style={{ fontFamily: 'Arial, sans-serif', color: '#000' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
        ECO Platform Compliance Declaration
      </h2>
      <p style={{ fontSize: '12px', marginBottom: '16px' }}>
        LCA Calculation Rules V2.0 (December 2024) | Compliance Score: {report.complianceValidation.complianceScore}%
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '11px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', width: '40%' }}>Standards</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>
              EN 15804+A2: {report.standardsCompliance.en15804A2 ? '✓' : '✗'} | 
              ECO Platform V2.0: {report.standardsCompliance.ecoPlatformV2 ? '✓' : '✗'} | 
              ISO 14025: {report.standardsCompliance.iso14025 ? '✓' : '✗'} | 
              ISO 21930: {report.standardsCompliance.iso21930 ? '✓' : '✗'}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Electricity Modelling (§2.5)</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>
              {report.energyTransparency.electricityModellingApproach} approach | 
              {report.energyTransparency.electricityPercentageOfA1A3.toFixed(1)}% of A1-A3
              {report.energyTransparency.electricityGwpKgCO2ePerKwh !== null && 
                ` | GWP: ${report.energyTransparency.electricityGwpKgCO2ePerKwh.toFixed(3)} kgCO2e/kWh`}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Characterisation Factors (§2.9)</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>
              {report.characterisationFactors.version} ({report.characterisationFactors.source})
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Allocation (§2.6)</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>
              {report.allocationStatement.allocationMethodUsed}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Data Quality (§2.7)</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>
              Rating: {report.dataQuality.overallRating} | 
              Temporal: {report.dataQuality.temporalCoverage} | 
              Geographical: {report.dataQuality.geographicalCoverage}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Biogenic Carbon (§2.11)</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>
              {report.biogenicCarbon.totalBiogenicCarbonKgC.toFixed(2)} kg C
              {report.biogenicCarbon.biogenicCarbonKgCO2e !== null && 
                ` (${report.biogenicCarbon.biogenicCarbonKgCO2e.toFixed(2)} kg CO2-e)`}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Manufacturing Locations (§2.12)</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>
              {report.manufacturingLocations.length > 0 
                ? report.manufacturingLocations.map(l => `${l.city}, ${l.country}`).join('; ')
                : 'Not specified'}
            </td>
          </tr>
        </tbody>
      </table>

      {!report.complianceValidation.isFullyCompliant && (
        <div style={{ marginTop: '16px' }}>
          {report.complianceValidation.nonCompliantItems.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#dc2626' }}>Non-Compliant Items:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                {report.complianceValidation.nonCompliantItems.map((item, i) => (
                  <li key={i} style={{ fontSize: '10px', color: '#dc2626' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: '9px', marginTop: '16px', color: '#666' }}>
        Generated: {new Date(report.generatedAt).toLocaleString()} | 
        Project: {report.projectName}
      </p>
    </div>
  );
}
