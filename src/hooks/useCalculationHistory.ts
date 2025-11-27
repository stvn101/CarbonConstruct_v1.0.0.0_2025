import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';

interface CalculationHistory {
  id: string;
  updatedAt: Date;
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
  isDraft: boolean;
}

export const useCalculationHistory = (limit = 5) => {
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentProject } = useProject();

  const fetchHistory = async () => {
    if (!currentProject?.id) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('unified_calculations')
        .select('id, updated_at, totals, is_draft')
        .eq('project_id', currentProject.id)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedHistory: CalculationHistory[] = (data || []).map((calc) => {
        const totals = calc.totals as any || {};
        return {
          id: calc.id,
          updatedAt: new Date(calc.updated_at || ''),
          totalEmissions: totals.total || 0,
          scope1: totals.scope1 || 0,
          scope2: totals.scope2 || 0,
          scope3: (totals.scope3_materials || 0) + (totals.scope3_transport || 0) + (totals.scope3_a5 || 0) + (totals.scope3_commute || 0) + (totals.scope3_waste || 0),
          isDraft: calc.is_draft || false,
        };
      });

      setHistory(formattedHistory);
    } catch (error) {
      logger.error('CalculationHistory:fetch', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentProject?.id, limit]);

  return { history, loading, refetch: fetchHistory };
};
