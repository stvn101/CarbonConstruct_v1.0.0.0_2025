/**
 * Hook for managing EPD renewal workflows
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type WorkflowStatus = 'pending' | 'contacted' | 'requested' | 'received' | 'verified' | 'completed' | 'cancelled';
export type WorkflowPriority = 'low' | 'medium' | 'high' | 'critical';

export interface EPDRenewalWorkflow {
  id: string;
  user_id: string;
  material_id: string;
  material_name: string;
  epd_number: string | null;
  manufacturer: string | null;
  expiry_date: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  supplier_contact_id: string | null;
  contact_date: string | null;
  request_date: string | null;
  expected_response_date: string | null;
  received_date: string | null;
  new_epd_number: string | null;
  new_expiry_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkflowData {
  material_id: string;
  material_name: string;
  epd_number?: string | null;
  manufacturer?: string | null;
  expiry_date: string;
  priority?: WorkflowPriority;
  supplier_contact_id?: string | null;
  notes?: string | null;
}

export interface UpdateWorkflowData {
  status?: WorkflowStatus;
  priority?: WorkflowPriority;
  supplier_contact_id?: string | null;
  contact_date?: string | null;
  request_date?: string | null;
  expected_response_date?: string | null;
  received_date?: string | null;
  new_epd_number?: string | null;
  new_expiry_date?: string | null;
  notes?: string | null;
}

const STATUS_ORDER: WorkflowStatus[] = ['pending', 'contacted', 'requested', 'received', 'verified', 'completed'];

export function useEPDRenewalWorkflows() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<EPDRenewalWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('epd_renewal_workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setWorkflows((data as EPDRenewalWorkflow[]) || []);
    } catch (error) {
      console.error('Error fetching EPD renewal workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load renewal workflows.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const createWorkflow = useCallback(async (data: CreateWorkflowData) => {
    if (!user) return null;

    setIsSaving(true);
    try {
      // Check if workflow already exists for this material
      const existing = workflows.find(w => 
        w.material_id === data.material_id && 
        !['completed', 'cancelled'].includes(w.status)
      );
      
      if (existing) {
        toast({
          title: "Workflow exists",
          description: "An active renewal workflow already exists for this material.",
          variant: "destructive",
        });
        return null;
      }

      const workflowData = {
        user_id: user.id,
        material_id: data.material_id,
        material_name: data.material_name,
        epd_number: data.epd_number || null,
        manufacturer: data.manufacturer || null,
        expiry_date: data.expiry_date,
        priority: data.priority || 'medium',
        supplier_contact_id: data.supplier_contact_id || null,
        notes: data.notes || null,
        status: 'pending' as const,
      };

      const { data: newWorkflow, error } = await supabase
        .from('epd_renewal_workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) throw error;

      setWorkflows(prev => [newWorkflow as EPDRenewalWorkflow, ...prev]);
      toast({
        title: "Workflow created",
        description: "EPD renewal workflow has been created.",
      });
      return newWorkflow as EPDRenewalWorkflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to create renewal workflow.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, workflows, toast]);

  const updateWorkflow = useCallback(async (id: string, updates: UpdateWorkflowData) => {
    if (!user) return false;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('epd_renewal_workflows')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setWorkflows(prev => prev.map(w => 
        w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w
      ));
      
      toast({
        title: "Workflow updated",
        description: "Renewal workflow has been updated.",
      });
      return true;
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to update workflow.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, toast]);

  const advanceStatus = useCallback(async (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return false;

    const currentIndex = STATUS_ORDER.indexOf(workflow.status);
    if (currentIndex === -1 || currentIndex >= STATUS_ORDER.length - 1) return false;

    const nextStatus = STATUS_ORDER[currentIndex + 1];
    const updates: UpdateWorkflowData = { status: nextStatus };

    // Auto-set dates based on status
    const now = new Date().toISOString();
    if (nextStatus === 'contacted') updates.contact_date = now;
    if (nextStatus === 'requested') updates.request_date = now;
    if (nextStatus === 'received') updates.received_date = now;

    return updateWorkflow(id, updates);
  }, [workflows, updateWorkflow]);

  const deleteWorkflow = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('epd_renewal_workflows')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== id));
      toast({
        title: "Workflow deleted",
        description: "Renewal workflow has been removed.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  // Get workflows grouped by status
  const getWorkflowsByStatus = useCallback(() => {
    const grouped: Record<WorkflowStatus, EPDRenewalWorkflow[]> = {
      pending: [],
      contacted: [],
      requested: [],
      received: [],
      verified: [],
      completed: [],
      cancelled: [],
    };

    workflows.forEach(w => {
      if (grouped[w.status]) {
        grouped[w.status].push(w);
      }
    });

    return grouped;
  }, [workflows]);

  // Get active workflow for a material
  const getWorkflowForMaterial = useCallback((materialId: string) => {
    return workflows.find(w => 
      w.material_id === materialId && 
      !['completed', 'cancelled'].includes(w.status)
    );
  }, [workflows]);

  // Statistics
  const stats = {
    total: workflows.length,
    active: workflows.filter(w => !['completed', 'cancelled'].includes(w.status)).length,
    pending: workflows.filter(w => w.status === 'pending').length,
    inProgress: workflows.filter(w => ['contacted', 'requested', 'received', 'verified'].includes(w.status)).length,
    completed: workflows.filter(w => w.status === 'completed').length,
    cancelled: workflows.filter(w => w.status === 'cancelled').length,
  };

  return {
    workflows,
    isLoading,
    isSaving,
    stats,
    createWorkflow,
    updateWorkflow,
    advanceStatus,
    deleteWorkflow,
    getWorkflowsByStatus,
    getWorkflowForMaterial,
    refetch: fetchWorkflows,
  };
}
