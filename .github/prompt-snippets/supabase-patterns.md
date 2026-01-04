# Supabase Patterns Snippet

Reference this file in other prompts using: `@supabase-patterns.md`

## Client Usage

### Correct Import
```typescript
// ✅ ALWAYS use the shared client
import { supabase } from "@/integrations/supabase/client";

// ❌ NEVER create new clients
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key); // WRONG
```

## Query Patterns

### Basic Select with Error Handling
```typescript
const { data, error } = await supabase
  .from('materials_epd')
  .select('*')
  .eq('material_category', category)
  .order('material_name');

if (error) {
  console.error('Query failed:', error);
  toast.error('Failed to load materials');
  return [];
}

return data ?? [];
```

### Pagination (Default 1000 Row Limit)
```typescript
// ✅ CORRECT: Handle pagination for large datasets
const PAGE_SIZE = 100;

async function fetchAllMaterials(): Promise<Material[]> {
  const allMaterials: Material[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('materials_epd')
      .select('*')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    
    allMaterials.push(...(data ?? []));
    hasMore = (data?.length ?? 0) === PAGE_SIZE;
    page++;
  }

  return allMaterials;
}
```

### Insert with Returning
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    name: projectName,
    user_id: user.id,
    project_type: 'commercial'
  })
  .select()
  .single();

if (error) {
  if (error.code === '23505') {
    toast.error('A project with this name already exists');
  } else {
    toast.error('Failed to create project');
  }
  return null;
}

return data;
```

### Update with RLS Context
```typescript
// RLS will automatically filter to user's own records
const { error } = await supabase
  .from('projects')
  .update({ status: 'completed' })
  .eq('id', projectId);
  // No need for .eq('user_id', user.id) - RLS handles it

if (error) {
  toast.error('Failed to update project');
}
```

### Delete with Confirmation
```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);

if (error) {
  console.error('Delete failed:', error);
  toast.error('Failed to delete project');
  return false;
}

toast.success('Project deleted');
return true;
```

## Authentication Patterns

### Get Current User
```typescript
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  // Redirect to login or show error
  return null;
}
```

### Auth State Listener
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/auth');
      } else if (session?.user) {
        setUser(session.user);
      }
    }
  );

  return () => subscription.unsubscribe();
}, [navigate]);
```

## Edge Function Patterns

### Standard CORS Headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle preflight
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

### JWT Verification
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(
    JSON.stringify({ error: 'Missing authorization header' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { global: { headers: { Authorization: authHeader } } }
);

const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return new Response(
    JSON.stringify({ error: 'Invalid token' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### Admin Role Check
```typescript
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .single();

const isAdmin = roles?.role === 'admin';

if (!isAdmin) {
  return new Response(
    JSON.stringify({ error: 'Admin access required' }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

## RLS Policy Patterns

### User-Owned Data
```sql
-- Select: Users can only see their own data
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

-- Insert: Users can only create for themselves
CREATE POLICY "Users can create own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update: Users can only modify their own data
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

-- Delete: Users can only delete their own data
CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);
```

### Public Read, Authenticated Write
```sql
-- Anyone can read materials
CREATE POLICY "Materials are publicly readable"
ON materials_epd FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Only admins can modify materials"
ON materials_epd FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

## Realtime Subscriptions

### Channel Subscription
```typescript
const channel = supabase
  .channel('project-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setProjects(prev => [...prev, payload.new as Project]);
      } else if (payload.eventType === 'UPDATE') {
        setProjects(prev => 
          prev.map(p => p.id === payload.new.id ? payload.new as Project : p)
        );
      } else if (payload.eventType === 'DELETE') {
        setProjects(prev => prev.filter(p => p.id !== payload.old.id));
      }
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

## Storage Patterns

### Upload File
```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${user.id}/${file.name}`, file, {
    cacheControl: '3600',
    upsert: false
  });

if (error) {
  toast.error('Upload failed');
  return null;
}

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('documents')
  .getPublicUrl(data.path);
```

## Error Codes Reference

| Code | Meaning | Action |
|------|---------|--------|
| 23505 | Unique violation | Show "already exists" message |
| 23503 | Foreign key violation | Referenced record missing |
| 42501 | RLS violation | User not authorized |
| PGRST116 | No rows returned | Handle empty state |
| 429 | Rate limited | Implement backoff |
