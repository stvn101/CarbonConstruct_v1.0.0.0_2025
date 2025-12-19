/**
 * Hook for managing supplier contacts
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type ContactType = 'manufacturer' | 'program_operator' | 'distributor';

export interface SupplierContact {
  id: string;
  user_id: string;
  company_name: string;
  contact_type: ContactType;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  epd_numbers: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierContactInput {
  company_name: string;
  contact_type: ContactType;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  epd_numbers?: string[];
}

export function useSupplierContacts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<SupplierContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('supplier_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('company_name');

      if (error) throw error;
      
      // Cast the data to the correct type
      setContacts((data || []) as SupplierContact[]);
    } catch (error) {
      console.error('Error fetching supplier contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Add contact
  const addContact = useCallback(async (input: SupplierContactInput): Promise<SupplierContact | null> => {
    if (!user) return null;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('supplier_contacts')
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;

      const newContact = data as SupplierContact;
      setContacts(prev => [...prev, newContact].sort((a, b) => a.company_name.localeCompare(b.company_name)));
      
      toast({
        title: "Contact added",
        description: `${input.company_name} has been added to your contacts.`,
      });

      return newContact;
    } catch (error) {
      console.error('Error adding supplier contact:', error);
      toast({
        title: "Error",
        description: "Failed to add supplier contact.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, toast]);

  // Update contact
  const updateContact = useCallback(async (id: string, input: Partial<SupplierContactInput>): Promise<boolean> => {
    if (!user) return false;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('supplier_contacts')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedContact = data as SupplierContact;
      setContacts(prev => 
        prev.map(c => c.id === id ? updatedContact : c)
          .sort((a, b) => a.company_name.localeCompare(b.company_name))
      );
      
      toast({
        title: "Contact updated",
        description: "Supplier contact has been updated.",
      });

      return true;
    } catch (error) {
      console.error('Error updating supplier contact:', error);
      toast({
        title: "Error",
        description: "Failed to update supplier contact.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, toast]);

  // Delete contact
  const deleteContact = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('supplier_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => prev.filter(c => c.id !== id));
      
      toast({
        title: "Contact deleted",
        description: "Supplier contact has been removed.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting supplier contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete supplier contact.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  // Search contacts by EPD number
  const findContactByEPD = useCallback((epdNumber: string): SupplierContact | undefined => {
    return contacts.find(c => 
      c.epd_numbers?.some(epd => 
        epd.toLowerCase().includes(epdNumber.toLowerCase())
      )
    );
  }, [contacts]);

  // Get contacts by type
  const getContactsByType = useCallback((type: ContactType): SupplierContact[] => {
    return contacts.filter(c => c.contact_type === type);
  }, [contacts]);

  return {
    contacts,
    isLoading,
    isSaving,
    addContact,
    updateContact,
    deleteContact,
    findContactByEPD,
    getContactsByType,
    refetch: fetchContacts,
  };
}
