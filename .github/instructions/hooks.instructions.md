# Custom Hooks Instructions

## Hook Template
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

export function useMyData(projectId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('table')
          .select('*')
          .eq('project_id', projectId);
        
        if (error) throw error;
        setData(data);
      } catch (err) {
        logger.error('useMyData', err);
        setError(err as Error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  return { data, loading, error };
}
```

## Patterns
- Return { data, loading, error } for data fetching
- Use useCallback for mutation functions
- Clean up subscriptions in useEffect return
- Handle errors with logger + toast

Last Updated: 2026-01-04
