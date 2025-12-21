/**
 * Supplier Contact Manager Component
 * Allows users to manage EPD program operator and manufacturer contacts
 * Includes Australian Business Number (ABN) validation with checksum
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  FileText,
  Plus,
  Pencil,
  Trash2,
  Search,
  Building,
  Shield,
  Truck,
  ExternalLink,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useSupplierContacts, SupplierContact, SupplierContactInput, ContactType } from '@/hooks/useSupplierContacts';

const contactTypeConfig: Record<ContactType, { label: string; icon: React.ElementType; color: string }> = {
  manufacturer: { label: 'Manufacturer', icon: Building, color: 'bg-blue-100 text-blue-800' },
  program_operator: { label: 'Program Operator', icon: Shield, color: 'bg-emerald-100 text-emerald-800' },
  distributor: { label: 'Distributor', icon: Truck, color: 'bg-amber-100 text-amber-800' },
};

interface ContactFormData {
  company_name: string;
  contact_type: ContactType;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  notes: string;
  epd_numbers: string;
  abn: string;
}

const defaultFormData: ContactFormData = {
  company_name: '',
  contact_type: 'manufacturer',
  contact_name: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  notes: '',
  epd_numbers: '',
  abn: '',
};

/**
 * Validates an Australian Business Number (ABN) using the official checksum algorithm.
 * 
 * ABN validation algorithm:
 * 1. Subtract 1 from the first digit
 * 2. Multiply each digit by its weighting factor (10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19)
 * 3. Sum all the products
 * 4. If the sum is divisible by 89, the ABN is valid
 * 
 * @param abn - The ABN string to validate (can include spaces)
 * @returns Object with isValid boolean and formatted ABN string
 */
function validateABN(abn: string): { isValid: boolean; formatted: string; error?: string } {
  // Remove spaces and non-numeric characters
  const cleanABN = abn.replace(/\s+/g, '').replace(/[^0-9]/g, '');
  
  // Must be exactly 11 digits
  if (cleanABN.length !== 11) {
    return { 
      isValid: false, 
      formatted: abn,
      error: 'ABN must be exactly 11 digits'
    };
  }

  // ABN weighting factors
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  
  // Convert to array of digits
  const digits = cleanABN.split('').map(Number);
  
  // Subtract 1 from the first digit (per ABN algorithm)
  digits[0] = digits[0] - 1;
  
  // Calculate weighted sum
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * weights[i];
  }
  
  // Check if divisible by 89
  const isValid = sum % 89 === 0;
  
  // Format ABN with spaces: XX XXX XXX XXX
  const formatted = `${cleanABN.slice(0, 2)} ${cleanABN.slice(2, 5)} ${cleanABN.slice(5, 8)} ${cleanABN.slice(8, 11)}`;
  
  return { 
    isValid, 
    formatted,
    error: isValid ? undefined : 'Invalid ABN checksum - please verify the number'
  };
}

export function SupplierContactManager() {
  const { contacts, isLoading, isSaving, addContact, updateContact, deleteContact } = useSupplierContacts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<SupplierContact | null>(null);
  const [formData, setFormData] = useState<ContactFormData>(defaultFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContactType | 'all'>('all');
  const [abnValidation, setAbnValidation] = useState<{ isValid: boolean; error?: string } | null>(null);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate ABN on change
    if (field === 'abn') {
      if (value.trim()) {
        const validation = validateABN(value);
        setAbnValidation({ isValid: validation.isValid, error: validation.error });
      } else {
        setAbnValidation(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.company_name.trim()) return;
    
    // Validate ABN if provided
    if (formData.abn.trim()) {
      const abnCheck = validateABN(formData.abn);
      if (!abnCheck.isValid) {
        return; // Don't submit if ABN is invalid
      }
    }

    const input: SupplierContactInput = {
      company_name: formData.company_name.trim(),
      contact_type: formData.contact_type,
      contact_name: formData.contact_name.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      website: formData.website.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      epd_numbers: formData.epd_numbers.split(',').map(s => s.trim()).filter(Boolean),
    };

    // Add ABN to notes if provided (since ABN field isn't in the database schema yet)
    if (formData.abn.trim()) {
      const abnValidation = validateABN(formData.abn);
      const abnNote = `ABN: ${abnValidation.formatted}`;
      input.notes = input.notes ? `${abnNote}\n\n${input.notes}` : abnNote;
    }

    if (editingContact) {
      await updateContact(editingContact.id, input);
    } else {
      await addContact(input);
    }

    setFormData(defaultFormData);
    setEditingContact(null);
    setAbnValidation(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (contact: SupplierContact) => {
    setEditingContact(contact);
    
    // Extract ABN from notes if present
    let abn = '';
    let notes = contact.notes || '';
    const abnMatch = notes.match(/^ABN:\s*([\d\s]+)/);
    if (abnMatch) {
      abn = abnMatch[1].trim();
      notes = notes.replace(/^ABN:\s*[\d\s]+\n*/, '').trim();
    }
    
    setFormData({
      company_name: contact.company_name,
      contact_type: contact.contact_type,
      contact_name: contact.contact_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      website: contact.website || '',
      address: contact.address || '',
      notes: notes,
      epd_numbers: contact.epd_numbers?.join(', ') || '',
      abn: abn,
    });
    
    if (abn) {
      const validation = validateABN(abn);
      setAbnValidation({ isValid: validation.isValid, error: validation.error });
    } else {
      setAbnValidation(null);
    }
    
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (contact: SupplierContact) => {
    if (confirm(`Are you sure you want to delete ${contact.company_name}?`)) {
      await deleteContact(contact.id);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.epd_numbers?.some(epd => epd.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || contact.contact_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const ContactCard = ({ contact }: { contact: SupplierContact }) => {
    const config = contactTypeConfig[contact.contact_type];
    const Icon = config.icon;
    
    // Extract ABN from notes if present
    const abnMatch = contact.notes?.match(/^ABN:\s*([\d\s]+)/);
    const displayABN = abnMatch ? abnMatch[1].trim() : null;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${config.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{contact.company_name}</h4>
                <Badge variant="outline" className="mt-1 text-xs">
                  {config.label}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(contact)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {displayABN && (
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">ABN: {displayABN}</span>
                <a 
                  href={`https://abr.business.gov.au/ABN/View?abn=${displayABN.replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1"
                  title="Verify on ABN Lookup"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {contact.contact_name && (
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                <span>{contact.contact_name}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <a href={`tel:${contact.phone}`} className="hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[200px]">
                  {contact.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {contact.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[200px]">{contact.address}</span>
              </div>
            )}
          </div>

          {contact.epd_numbers && contact.epd_numbers.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <FileText className="h-3 w-3" />
                <span>Associated EPDs:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {contact.epd_numbers.slice(0, 3).map(epd => (
                  <Badge key={epd} variant="secondary" className="text-xs">
                    {epd}
                  </Badge>
                ))}
                {contact.epd_numbers.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{contact.epd_numbers.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Supplier Contacts
            </CardTitle>
            <CardDescription>
              Manage EPD program operators and manufacturer contacts for streamlined renewal requests
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setFormData(defaultFormData);
              setEditingContact(null);
              setAbnValidation(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? 'Edit Contact' : 'Add Supplier Contact'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="e.g., BlueScope Steel"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="contact_type">Contact Type *</Label>
                    <Select
                      value={formData.contact_type}
                      onValueChange={(value) => handleInputChange('contact_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="program_operator">Program Operator</SelectItem>
                        <SelectItem value="distributor">Distributor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ABN Field with validation */}
                  <div className="col-span-2">
                    <Label htmlFor="abn" className="flex items-center gap-2">
                      Australian Business Number (ABN)
                      {abnValidation && (
                        abnValidation.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )
                      )}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="abn"
                        value={formData.abn}
                        onChange={(e) => handleInputChange('abn', e.target.value)}
                        placeholder="XX XXX XXX XXX"
                        className={abnValidation && !abnValidation.isValid ? 'border-destructive' : ''}
                      />
                      {formData.abn && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                          className="shrink-0"
                        >
                          <a
                            href={`https://abr.business.gov.au/ABN/View?abn=${formData.abn.replace(/\s/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Verify
                          </a>
                        </Button>
                      )}
                    </div>
                    {abnValidation && abnValidation.error && (
                      <p className="text-xs text-destructive mt-1">{abnValidation.error}</p>
                    )}
                    {abnValidation && abnValidation.isValid && (
                      <p className="text-xs text-green-600 mt-1">Valid ABN format</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contact_name">Contact Person</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name}
                      onChange={(e) => handleInputChange('contact_name', e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+61 2 1234 5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://company.com"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Industrial Ave, Sydney NSW 2000"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="epd_numbers">Associated EPD Numbers</Label>
                    <Input
                      id="epd_numbers"
                      value={formData.epd_numbers}
                      onChange={(e) => handleInputChange('epd_numbers', e.target.value)}
                      placeholder="EPD-001, EPD-002 (comma separated)"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any additional notes about this supplier..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSaving || !formData.company_name.trim() || (formData.abn.trim() !== '' && abnValidation !== null && !abnValidation.isValid)}
                >
                  {isSaving ? 'Saving...' : editingContact ? 'Update Contact' : 'Add Contact'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filter */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts, EPDs, ABN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={(value) => setFilterType(value as ContactType | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="manufacturer">Manufacturers</SelectItem>
              <SelectItem value="program_operator">Program Operators</SelectItem>
              <SelectItem value="distributor">Distributors</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading contacts...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {contacts.length === 0 
              ? "No supplier contacts yet. Add your first contact to get started."
              : "No contacts match your search."}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
