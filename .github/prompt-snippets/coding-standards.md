# Coding Standards Snippet

Reference this file in other prompts using: `@coding-standards.md`

## TypeScript Standards

### Strict Mode Compliance
```typescript
// ✅ CORRECT: Explicit types, no `any`
interface MaterialInput {
  name: string;
  quantity: number;
  unit: 'kg' | 'm3' | 'm2' | 'm';
}

function calculateEmissions(material: MaterialInput): number {
  return material.quantity * getEmissionFactor(material.name);
}

// ❌ WRONG: Implicit any, missing return type
function calculateEmissions(material) {
  return material.quantity * getEmissionFactor(material.name);
}
```

### Import Patterns
```typescript
// ✅ CORRECT: Use path aliases
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// ❌ WRONG: Relative imports
import { Button } from "../../../components/ui/button";
```

### Null Safety
```typescript
// ✅ CORRECT: Explicit null checks
const user = session?.user;
if (!user) {
  throw new Error("User not authenticated");
}

// ❌ WRONG: Assumes existence
const userId = session.user.id; // May crash
```

## React Patterns

### Component Structure
```typescript
// ✅ CORRECT: Props interface, explicit return
interface MaterialCardProps {
  material: Material;
  onSelect: (id: string) => void;
  isSelected?: boolean;
}

export function MaterialCard({ 
  material, 
  onSelect, 
  isSelected = false 
}: MaterialCardProps): JSX.Element {
  return (
    <Card className={cn("p-4", isSelected && "border-primary")}>
      {/* ... */}
    </Card>
  );
}
```

### Hook Dependencies
```typescript
// ✅ CORRECT: Complete dependency array
const fetchMaterials = useCallback(async () => {
  const { data } = await supabase
    .from('materials_epd')
    .select('*')
    .eq('category', category);
  setMaterials(data ?? []);
}, [category]); // category is a dependency

useEffect(() => {
  fetchMaterials();
}, [fetchMaterials]);
```

### Error Boundaries
```typescript
// ✅ CORRECT: Wrap complex components
<ErrorBoundary fallback={<ErrorState />}>
  <CalculatorPanel />
</ErrorBoundary>
```

## Tailwind Standards

### Use Semantic Tokens
```typescript
// ✅ CORRECT: Semantic tokens from design system
<div className="bg-background text-foreground border-border">
  <Button variant="default">Primary Action</Button>
</div>

// ❌ WRONG: Arbitrary colors
<div className="bg-white text-gray-900 border-gray-200">
  <button className="bg-blue-500">Action</button>
</div>
```

### Responsive Design
```typescript
// ✅ CORRECT: Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## Error Handling

### Toast Notifications
```typescript
import { toast } from "sonner";

// ✅ CORRECT: User-friendly messages
try {
  await saveProject(data);
  toast.success("Project saved successfully");
} catch (error) {
  console.error("Save failed:", error);
  toast.error("Failed to save project. Please try again.");
}
```

### Edge Function Errors
```typescript
// ✅ CORRECT: Structured error response
if (!user) {
  return new Response(
    JSON.stringify({ error: "Authentication required" }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

## Financial Calculations

### Always Use Decimal.js
```typescript
import Decimal from 'decimal.js';

// ✅ CORRECT: Precise decimal arithmetic
const netAmount = new Decimal(grossAmount);
const gstAmount = netAmount.times(0.10);
const total = netAmount.plus(gstAmount);

// ❌ WRONG: Floating point errors
const gst = grossAmount * 0.10; // May have precision issues
```

## Logging Standards

### Production-Safe Logging
```typescript
import { logger } from '@/lib/logger';

// ✅ CORRECT: Structured logging, no PII
logger.info('Material calculation completed', { 
  materialCount: materials.length,
  totalEmissions: total 
});

// ❌ WRONG: Console.log with sensitive data
console.log('User:', user.email, 'calculated:', data);
```

## File Size Limits

| File Type | Max Lines | Action if Exceeded |
|-----------|-----------|-------------------|
| Component | 300 | Extract sub-components |
| Hook | 200 | Split responsibilities |
| Utility | 150 | Create focused modules |
| Edge Function | 250 | Extract shared logic |
