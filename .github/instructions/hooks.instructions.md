---
applyTo: "src/hooks/**/*.ts,src/hooks/**/*.tsx"
---

# Custom Hooks Development Guide

## Hook Structure

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface UseMyDataResult {
  data: MyDataType[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  addItem: (item: NewItemType) => Promise<void>;
}

export function useMyData(projectId: string): UseMyDataResult {
  const queryClient = useQueryClient();

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['my-data', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('fetch_my_data_failed', { projectId, error });
        throw error;
      }
      return data;
    },
    enabled: !!projectId,
  });

  const addMutation = useMutation({
    mutationFn: async (item: NewItemType) => {
      const { data, error } = await supabase
        .from('my_table')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-data', projectId] });
      toast({ title: "Success", description: "Item added successfully" });
    },
    onError: (error) => {
      logger.error('add_item_failed', { error });
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: "Failed to add item" 
      });
    },
  });

  const addItem = useCallback(async (item: NewItemType) => {
    await addMutation.mutateAsync(item);
  }, [addMutation]);

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
    addItem,
  };
}
```

## Query Key Conventions

```typescript
// Consistent query key structure
const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['project', id] as const,
  materials: (projectId: string) => ['materials', projectId] as const,
  emissions: (projectId: string, scope: number) => ['emissions', projectId, scope] as const,
};
```

## Financial Calculations

```typescript
import Decimal from 'decimal.js';

// Always use Decimal.js for money
export function useGSTCalculation(netAmount: number) {
  const net = new Decimal(netAmount);
  const gst = net.mul(0.10).toDecimalPlaces(2);
  const gross = net.plus(gst);

  return {
    net: net.toNumber(),
    gst: gst.toNumber(),
    gross: gross.toNumber(),
  };
}
```

## Authentication Hook Pattern

```typescript
import { useAuth } from "@/contexts/AuthContext";

export function useProtectedAction() {
  const { user, isLoading } = useAuth();

  const performAction = useCallback(async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to continue",
      });
      return;
    }

    // Proceed with action
  }, [user]);

  return { performAction, isLoading, isAuthenticated: !!user };
}
```

## Subscription/Tier Checking

```typescript
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

export function useFeatureAccess() {
  const { tierName, isProOrHigher, canAccess } = useSubscriptionStatus();

  const checkAccess = useCallback((feature: string) => {
    if (!canAccess(feature)) {
      toast({
        title: "Upgrade required",
        description: `${feature} is available on Pro plan and above`,
      });
      return false;
    }
    return true;
  }, [canAccess]);

  return { tierName, isProOrHigher, checkAccess };
}
```

## Error Handling Pattern

```typescript
import { logger } from "@/lib/logger";
import { toast } from "@/hooks/use-toast";

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context: string) => {
    const message = error instanceof Error ? error.message : 'An error occurred';
    
    logger.error(`${context}_error`, { 
      error: message,
      stack: error instanceof Error ? error.stack : undefined 
    });

    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  }, []);

  return { handleError };
}
```

## Debounced Hook

```typescript
import { useState, useEffect, useMemo } from 'react';
import { debounce } from "@/lib/debounce";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage for search
export function useSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });
}
```

## Local Storage Hook

```typescript
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.error('localStorage_write_failed', { key, error });
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}
```

## Hook Naming Conventions

```typescript
// Data fetching hooks
useProjects()
useProject(id: string)
useMaterials(projectId: string)

// Action hooks
useCreateProject()
useUpdateMaterial()
useDeleteEmission()

// State hooks
useProjectState()
useCalculatorForm()

// Feature hooks
useEmissionCalculations()
useComplianceCheck()
useSubscriptionStatus()
```

## Checklist

Before committing:

- [ ] Return type interface defined
- [ ] TanStack Query for server state
- [ ] Error handling with logger and toast
- [ ] Loading states exposed
- [ ] Decimal.js for financial calculations
- [ ] useCallback for stable function references
- [ ] Cleanup in useEffect return
- [ ] Auth checks where required
