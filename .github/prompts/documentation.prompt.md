# Documentation Prompt

Generate documentation for CarbonConstruct code:

## Documentation Types

### 1. Function/Component Documentation

```typescript
/**
 * Calculates total emissions for a material based on quantity and emission factor.
 * 
 * @param material - The material data including quantity and emission factor
 * @returns Emission result in kgCO2e
 * 
 * @example
 * ```typescript
 * const result = calculateEmissions({
 *   name: 'Concrete',
 *   quantity: 1000,
 *   factor: 0.12,
 *   unit: 'kg'
 * });
 * console.log(result.kgCO2e); // 120
 * ```
 * 
 * @remarks
 * Uses Decimal.js for precision. Follows EN 15978 A1-A3 stage methodology.
 * 
 * @see {@link https://www.iso.org/standard/38914.html} EN 15978 Standard
 */
export function calculateEmissions(material: MaterialInput): EmissionResult {
  // Implementation
}
```

### 2. Type Documentation

```typescript
/**
 * Represents a material in the carbon calculator.
 * 
 * @property id - Unique identifier (UUID)
 * @property name - Material name (max 300 chars for EPD names)
 * @property quantity - Amount in specified unit
 * @property unit - Unit of measurement
 * @property ef_total - Total emission factor in kgCO2e per unit
 * @property lcaStage - EN 15978 lifecycle stage
 */
interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: MaterialUnit;
  ef_total: number;
  lcaStage: LCAStage;
}
```

### 3. Hook Documentation

```typescript
/**
 * Manages material data fetching and mutations for a project.
 * 
 * @param projectId - The project UUID to fetch materials for
 * @returns Object containing materials data, loading state, and CRUD operations
 * 
 * @example
 * ```typescript
 * function MaterialsList({ projectId }: Props) {
 *   const { materials, isLoading, addMaterial } = useMaterials(projectId);
 *   
 *   if (isLoading) return <Skeleton />;
 *   
 *   return materials.map(m => <MaterialCard key={m.id} material={m} />);
 * }
 * ```
 * 
 * @remarks
 * - Uses TanStack Query for caching
 * - Automatically invalidates on mutations
 * - Handles optimistic updates
 * 
 * @see useProject for project context
 * @see useEmissions for emission calculations
 */
export function useMaterials(projectId: string): UseMaterialsResult {}
```

## CarbonConstruct Context

When documenting, include:

### EN 15978 References
- Which lifecycle stages apply
- Calculation methodology
- Data quality requirements

### Australian Compliance
- NCC 2024 Section J relevance
- Green Star credit mapping
- NABERS integration points

### Security Considerations
- Authentication requirements
- Data access restrictions
- Input validation needs

## Include:

1. **Purpose and Usage**
   - What does this code do?
   - When should it be used?
   - Who uses it?

2. **Parameters and Return Types**
   - All params documented
   - Return type explained
   - Possible errors listed

3. **Examples**
   - Basic usage
   - Edge cases
   - Error handling

4. **Edge Cases and Limitations**
   - Known limitations
   - Boundary conditions
   - Performance considerations

## Output Format

Generate documentation in this order:
1. JSDoc comments for code
2. README section if applicable
3. API documentation if endpoint
4. Changelog entry if significant change
