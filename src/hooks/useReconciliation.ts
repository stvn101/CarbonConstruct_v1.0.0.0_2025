import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Decimal from 'decimal.js';

export interface ReconciliationRun {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_invoice_items: number;
  matched_items: number;
  unmatched_items: number;
  total_variance_quantity: number;
  total_variance_carbon_kg: number;
  total_variance_cost_cents: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  run_id: string;
  document_id: string | null;
  line_number: number;
  raw_description: string;
  normalized_description: string | null;
  quantity: number;
  unit: string;
  unit_price_cents: number | null;
  total_price_cents: number | null;
  material_category: string | null;
  confidence_score: number;
  created_at: string;
}

export interface BOQItemSnapshot {
  id: string;
  run_id: string;
  original_material_id: string | null;
  material_name: string;
  material_category: string | null;
  quantity_estimated: number;
  unit: string;
  carbon_factor: number;
  carbon_total_kg: number;
  data_source: string | null;
  created_at: string;
}

export interface ReconciliationMatch {
  id: string;
  run_id: string;
  invoice_item_id: string;
  boq_item_id: string | null;
  match_type: 'exact' | 'fuzzy' | 'category' | 'manual' | 'unmatched';
  match_score: number;
  quantity_estimated: number | null;
  quantity_actual: number | null;
  quantity_variance: number | null;
  quantity_variance_pct: number | null;
  carbon_estimated_kg: number | null;
  carbon_actual_kg: number | null;
  carbon_variance_kg: number | null;
  cost_variance_cents: number | null;
  is_override: boolean;
  override_reason: string | null;
  created_at: string;
  updated_at: string;
}

export function useReconciliation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingRunId, setProcessingRunId] = useState<string | null>(null);

  // Fetch all reconciliation runs for the user
  const { data: runs, isLoading: runsLoading, refetch: refetchRuns } = useQuery({
    queryKey: ['reconciliation-runs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reconciliation_runs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ReconciliationRun[];
    },
    enabled: !!user,
  });

  // Create a new reconciliation run
  const createRun = useMutation({
    mutationFn: async ({ name, projectId, boqItems }: { 
      name: string; 
      projectId?: string;
      boqItems: Array<{
        id: string;
        name: string;
        category: string;
        quantity: number;
        unit: string;
        factor: number;
        source: string;
      }>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Create the run
      const { data: run, error: runError } = await supabase
        .from('reconciliation_runs')
        .insert({
          user_id: user.id,
          project_id: projectId || null,
          name,
          status: 'pending',
        })
        .select()
        .single();

      if (runError) throw runError;

      // Snapshot BOQ items
      if (boqItems.length > 0) {
        const snapshots = boqItems.map(item => ({
          run_id: run.id,
          original_material_id: item.id,
          material_name: item.name,
          material_category: item.category,
          quantity_estimated: item.quantity,
          unit: item.unit,
          carbon_factor: item.factor,
          carbon_total_kg: new Decimal(item.quantity).times(item.factor).toNumber(),
          data_source: item.source,
        }));

        const { error: snapshotError } = await supabase
          .from('boq_items_snapshot')
          .insert(snapshots);

        if (snapshotError) throw snapshotError;
      }

      return run;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-runs'] });
      toast({ title: 'Reconciliation run created' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to create run', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    },
  });

  // Parse invoice document
  const parseInvoice = useCallback(async (text: string, fileType: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await supabase.functions.invoke('parse-invoice', {
      body: { text, fileType },
    });

    if (response.error) throw response.error;
    return response.data.items;
  }, []);

  // Add invoice items to a run
  const addInvoiceItems = useMutation({
    mutationFn: async ({ 
      runId, 
      items,
      documentId 
    }: { 
      runId: string; 
      items: Array<{
        lineNumber: number;
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number | null;
        totalPrice: number | null;
        category: string | null;
        confidence: number;
      }>;
      documentId?: string;
    }) => {
      const insertItems = items.map(item => ({
        run_id: runId,
        document_id: documentId || null,
        line_number: item.lineNumber,
        raw_description: item.description,
        normalized_description: item.description.toLowerCase().trim(),
        quantity: item.quantity,
        unit: item.unit,
        unit_price_cents: item.unitPrice,
        total_price_cents: item.totalPrice,
        material_category: item.category,
        confidence_score: item.confidence,
      }));

      const { data, error } = await supabase
        .from('invoice_items')
        .insert(insertItems)
        .select();

      if (error) throw error;

      // Update run totals
      await supabase
        .from('reconciliation_runs')
        .update({ 
          total_invoice_items: items.length,
          status: 'processing' 
        })
        .eq('id', runId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-runs'] });
    },
  });

  // Run matching algorithm
  const runMatching = useMutation({
    mutationFn: async (runId: string) => {
      setProcessingRunId(runId);

      // Get invoice items
      const { data: invoiceItems, error: invoiceError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('run_id', runId);

      if (invoiceError) throw invoiceError;

      // Get BOQ snapshots
      const { data: boqItems, error: boqError } = await supabase
        .from('boq_items_snapshot')
        .select('*')
        .eq('run_id', runId);

      if (boqError) throw boqError;

      // Simple matching algorithm
      const matches: Array<{
        run_id: string;
        invoice_item_id: string;
        boq_item_id: string | null;
        match_type: string;
        match_score: number;
        quantity_estimated: number | null;
        quantity_actual: number;
        quantity_variance: number | null;
        quantity_variance_pct: number | null;
        carbon_estimated_kg: number | null;
        carbon_actual_kg: number | null;
        carbon_variance_kg: number | null;
      }> = [];

      let matchedCount = 0;
      let unmatchedCount = 0;
      let totalQuantityVariance = new Decimal(0);
      let totalCarbonVariance = new Decimal(0);

      for (const invoice of (invoiceItems || [])) {
        const normalizedInvoice = invoice.raw_description.toLowerCase();
        
        // Try exact match first
        let bestMatch: BOQItemSnapshot | null = null;
        let bestScore = 0;
        let matchType = 'unmatched';

        for (const boq of (boqItems || [])) {
          const normalizedBoq = boq.material_name.toLowerCase();
          
          // Exact match
          if (normalizedBoq === normalizedInvoice) {
            bestMatch = boq;
            bestScore = 1.0;
            matchType = 'exact';
            break;
          }
          
          // Contains match
          if (normalizedInvoice.includes(normalizedBoq) || normalizedBoq.includes(normalizedInvoice)) {
            const score = 0.7;
            if (score > bestScore) {
              bestMatch = boq;
              bestScore = score;
              matchType = 'fuzzy';
            }
          }
          
          // Category match
          if (invoice.material_category && boq.material_category &&
              invoice.material_category.toLowerCase() === boq.material_category.toLowerCase()) {
            const score = 0.5;
            if (score > bestScore) {
              bestMatch = boq;
              bestScore = score;
              matchType = 'category';
            }
          }
        }

        // Calculate variances
        let quantityVariance: number | null = null;
        let quantityVariancePct: number | null = null;
        let carbonEstimated: number | null = null;
        let carbonActual: number | null = null;
        let carbonVariance: number | null = null;

        if (bestMatch) {
          matchedCount++;
          quantityVariance = new Decimal(invoice.quantity).minus(bestMatch.quantity_estimated).toNumber();
          quantityVariancePct = bestMatch.quantity_estimated > 0 
            ? new Decimal(quantityVariance).div(bestMatch.quantity_estimated).times(100).toNumber()
            : null;
          carbonEstimated = bestMatch.carbon_total_kg;
          carbonActual = new Decimal(invoice.quantity).times(bestMatch.carbon_factor).toNumber();
          carbonVariance = new Decimal(carbonActual).minus(carbonEstimated).toNumber();

          totalQuantityVariance = totalQuantityVariance.plus(Math.abs(quantityVariance));
          totalCarbonVariance = totalCarbonVariance.plus(carbonVariance);
        } else {
          unmatchedCount++;
        }

        matches.push({
          run_id: runId,
          invoice_item_id: invoice.id,
          boq_item_id: bestMatch?.id || null,
          match_type: matchType,
          match_score: bestScore,
          quantity_estimated: bestMatch?.quantity_estimated || null,
          quantity_actual: invoice.quantity,
          quantity_variance: quantityVariance,
          quantity_variance_pct: quantityVariancePct,
          carbon_estimated_kg: carbonEstimated,
          carbon_actual_kg: carbonActual,
          carbon_variance_kg: carbonVariance,
        });
      }

      // Insert matches
      if (matches.length > 0) {
        const { error: matchError } = await supabase
          .from('reconciliation_matches')
          .insert(matches);

        if (matchError) throw matchError;
      }

      // Update run with results
      const { error: updateError } = await supabase
        .from('reconciliation_runs')
        .update({
          status: 'completed',
          matched_items: matchedCount,
          unmatched_items: unmatchedCount,
          total_variance_quantity: totalQuantityVariance.toNumber(),
          total_variance_carbon_kg: totalCarbonVariance.toNumber(),
        })
        .eq('id', runId);

      if (updateError) throw updateError;

      return { matchedCount, unmatchedCount };
    },
    onSuccess: () => {
      setProcessingRunId(null);
      queryClient.invalidateQueries({ queryKey: ['reconciliation-runs'] });
      toast({ title: 'Matching complete' });
    },
    onError: (error) => {
      setProcessingRunId(null);
      toast({ 
        title: 'Matching failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    },
  });

  // Delete a run
  const deleteRun = useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase
        .from('reconciliation_runs')
        .delete()
        .eq('id', runId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-runs'] });
      toast({ title: 'Run deleted' });
    },
  });

  return {
    runs,
    runsLoading,
    refetchRuns,
    createRun,
    parseInvoice,
    addInvoiceItems,
    runMatching,
    deleteRun,
    processingRunId,
  };
}
