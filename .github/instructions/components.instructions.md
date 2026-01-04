---
applyTo: "src/components/**/*.tsx"
---

# React Component Development Guide

## Component Structure

```typescript
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MyComponentProps {
  /** Description of the prop */
  title: string;
  /** Optional prop with default */
  variant?: 'default' | 'compact';
  /** Callback when action occurs */
  onAction?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function MyComponent({ 
  title, 
  variant = 'default',
  onAction,
  className 
}: MyComponentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAction?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleClick} 
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Loading...' : 'Action'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

## shadcn/ui Components

Always use shadcn/ui primitives from `@/components/ui/`:

```typescript
// Available components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
```

## Tailwind CSS Guidelines

### Use Semantic Tokens Only

```typescript
// ✅ Correct - semantic tokens
<div className="bg-background text-foreground" />
<div className="bg-card text-card-foreground border-border" />
<div className="bg-primary text-primary-foreground" />
<div className="bg-secondary text-secondary-foreground" />
<div className="bg-muted text-muted-foreground" />
<div className="bg-accent text-accent-foreground" />
<div className="bg-destructive text-destructive-foreground" />

// ❌ Never use direct colors
<div className="bg-white text-black" />
<div className="bg-gray-100" />
<div className="bg-[#1a1a1a]" />
<div className="text-blue-500" />
```

### Responsive Design

```typescript
// Mobile-first approach
<div className="
  flex flex-col gap-2
  md:flex-row md:gap-4
  lg:gap-6
">

// Container patterns
<div className="container mx-auto px-4 md:px-6" />
```

## Accessibility Requirements

### Touch Targets (WCAG 2.2 AA)
```typescript
// Minimum 44x44px for touch targets
<Button className="min-h-[44px] min-w-[44px]" />

// Icon buttons need labels
<Button 
  variant="ghost" 
  size="icon" 
  aria-label="Close dialog"
>
  <X className="h-4 w-4" />
</Button>
```

### Semantic HTML
```typescript
// Use semantic elements
<main>
  <header>
    <nav aria-label="Main navigation" />
  </header>
  <section aria-labelledby="section-title">
    <h2 id="section-title">Section Title</h2>
    <article>Content</article>
  </section>
  <footer />
</main>
```

### Focus Management
```typescript
// Ensure focus is visible
<Button className="focus-visible:ring-2 focus-visible:ring-ring" />

// Focus trap in dialogs (handled by shadcn/ui)
<Dialog>
  <DialogContent>
    {/* Focus trapped here */}
  </DialogContent>
</Dialog>
```

### Screen Reader Support
```typescript
// Hidden text for screen readers
<span className="sr-only">Additional context</span>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

## Loading States

```typescript
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton loading
function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// Button loading state
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

## Error States

```typescript
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

function ErrorDisplay({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
```

## Toast Notifications

```typescript
import { toast } from "@/hooks/use-toast";

// Success
toast({
  title: "Saved",
  description: "Your changes have been saved successfully.",
});

// Error
toast({
  variant: "destructive",
  title: "Error",
  description: "Failed to save changes. Please try again.",
});

// With action
toast({
  title: "Deleted",
  description: "Item has been deleted.",
  action: <Button variant="outline" size="sm">Undo</Button>,
});
```

## Icons (Lucide)

```typescript
import { 
  Plus, Minus, X, Check,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Loader2, AlertTriangle, Info, 
  Download, Upload, Save, Trash2, Edit,
  Search, Filter, Settings
} from "lucide-react";

// Standard icon sizes
<Icon className="h-4 w-4" />  // Small (in buttons, badges)
<Icon className="h-5 w-5" />  // Medium (standalone)
<Icon className="h-6 w-6" />  // Large (headers)
```

## Component Checklist

Before committing:

- [ ] Props interface defined with JSDoc
- [ ] Semantic Tailwind tokens only
- [ ] Minimum touch targets (44x44px)
- [ ] aria-labels on icon buttons
- [ ] Loading and error states
- [ ] Responsive design
- [ ] Keyboard navigation works
- [ ] Component under 300 lines
