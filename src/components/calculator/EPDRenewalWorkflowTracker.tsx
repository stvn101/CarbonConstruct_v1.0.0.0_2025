/**
 * EPD Renewal Workflow Tracker Component
 * Tracks the status of EPD renewal requests from contact to completion
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  GitBranch, 
  Plus, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Loader2,
  Trash2,
  Edit,
  Mail,
  Building2,
  FileText,
  ArrowRight
} from 'lucide-react';
import { 
  useEPDRenewalWorkflows, 
  EPDRenewalWorkflow, 
  WorkflowStatus, 
  WorkflowPriority,
  CreateWorkflowData 
} from '@/hooks/useEPDRenewalWorkflows';
import { useSupplierContacts } from '@/hooks/useSupplierContacts';
import { format } from 'date-fns';

interface ExpiringMaterial {
  id: string;
  material_name: string;
  epd_number?: string | null;
  manufacturer?: string | null;
  expiry_date: string;
  days_until_expiry: number;
}

interface EPDRenewalWorkflowTrackerProps {
  expiringMaterials?: ExpiringMaterial[];
}

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="h-4 w-4" />, color: 'bg-muted text-muted-foreground' },
  contacted: { label: 'Contacted', icon: <Mail className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  requested: { label: 'Requested', icon: <FileText className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  received: { label: 'Received', icon: <ArrowRight className="h-4 w-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  verified: { label: 'Verified', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  completed: { label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  cancelled: { label: 'Cancelled', icon: <XCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

const PRIORITY_CONFIG: Record<WorkflowPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

const STATUS_ORDER: WorkflowStatus[] = ['pending', 'contacted', 'requested', 'received', 'verified', 'completed'];

function getStatusProgress(status: WorkflowStatus): number {
  if (status === 'cancelled') return 0;
  const index = STATUS_ORDER.indexOf(status);
  return ((index + 1) / STATUS_ORDER.length) * 100;
}

export function EPDRenewalWorkflowTracker({ expiringMaterials = [] }: EPDRenewalWorkflowTrackerProps) {
  const { 
    workflows, 
    isLoading, 
    isSaving, 
    stats,
    createWorkflow, 
    updateWorkflow, 
    advanceStatus,
    deleteWorkflow,
    getWorkflowForMaterial 
  } = useEPDRenewalWorkflows();
  
  const { contacts } = useSupplierContacts();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Create workflow form state
  const [newWorkflow, setNewWorkflow] = useState<CreateWorkflowData>({
    material_id: '',
    material_name: '',
    epd_number: '',
    manufacturer: '',
    expiry_date: '',
    priority: 'medium',
    supplier_contact_id: null,
    notes: '',
  });

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.material_name || !newWorkflow.expiry_date) return;
    
    const result = await createWorkflow(newWorkflow);
    if (result) {
      setIsCreateOpen(false);
      setNewWorkflow({
        material_id: '',
        material_name: '',
        epd_number: '',
        manufacturer: '',
        expiry_date: '',
        priority: 'medium',
        supplier_contact_id: null,
        notes: '',
      });
    }
  };

  const handleQuickCreate = async (material: ExpiringMaterial) => {
    // Determine priority based on days until expiry
    let priority: WorkflowPriority = 'medium';
    if (material.days_until_expiry < 0) priority = 'critical';
    else if (material.days_until_expiry <= 30) priority = 'high';
    else if (material.days_until_expiry > 90) priority = 'low';

    await createWorkflow({
      material_id: material.id,
      material_name: material.material_name,
      epd_number: material.epd_number,
      manufacturer: material.manufacturer,
      expiry_date: material.expiry_date,
      priority,
    });
  };

  const activeWorkflows = workflows.filter(w => !['completed', 'cancelled'].includes(w.status));
  const completedWorkflows = workflows.filter(w => w.status === 'completed');
  const cancelledWorkflows = workflows.filter(w => w.status === 'cancelled');

  // Materials without active workflows
  const materialsWithoutWorkflow = expiringMaterials.filter(
    m => !getWorkflowForMaterial(m.id)
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              EPD Renewal Workflow Tracker
            </CardTitle>
            <CardDescription>
              Track renewal requests from initial contact to completion
            </CardDescription>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Renewal Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Material Name *</Label>
                  <Input
                    value={newWorkflow.material_name}
                    onChange={e => setNewWorkflow(prev => ({ 
                      ...prev, 
                      material_name: e.target.value,
                      material_id: e.target.value.toLowerCase().replace(/\s+/g, '-')
                    }))}
                    placeholder="e.g., Steel Reinforcement Bar"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>EPD Number</Label>
                    <Input
                      value={newWorkflow.epd_number || ''}
                      onChange={e => setNewWorkflow(prev => ({ ...prev, epd_number: e.target.value }))}
                      placeholder="e.g., EPD-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manufacturer</Label>
                    <Input
                      value={newWorkflow.manufacturer || ''}
                      onChange={e => setNewWorkflow(prev => ({ ...prev, manufacturer: e.target.value }))}
                      placeholder="e.g., BlueScope"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={newWorkflow.expiry_date}
                      onChange={e => setNewWorkflow(prev => ({ ...prev, expiry_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newWorkflow.priority}
                      onValueChange={(value: WorkflowPriority) => setNewWorkflow(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {contacts.length > 0 && (
                  <div className="space-y-2">
                    <Label>Supplier Contact</Label>
                    <Select
                      value={newWorkflow.supplier_contact_id || 'none'}
                      onValueChange={value => setNewWorkflow(prev => ({ 
                        ...prev, 
                        supplier_contact_id: value === 'none' ? null : value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No contact</SelectItem>
                        {contacts.map(contact => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newWorkflow.notes || ''}
                    onChange={e => setNewWorkflow(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateWorkflow}
                  disabled={!newWorkflow.material_name || !newWorkflow.expiry_date || isSaving}
                >
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Workflow
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{stats.active} Active</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{stats.pending} Pending</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              {stats.completed} Completed
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Quick create from expiring materials */}
        {materialsWithoutWorkflow.length > 0 && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">
              Materials needing renewal workflow ({materialsWithoutWorkflow.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {materialsWithoutWorkflow.slice(0, 5).map(material => (
                <Button
                  key={material.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickCreate(material)}
                  disabled={isSaving}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {material.material_name}
                </Button>
              ))}
              {materialsWithoutWorkflow.length > 5 && (
                <Badge variant="secondary">+{materialsWithoutWorkflow.length - 5} more</Badge>
              )}
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active ({activeWorkflows.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedWorkflows.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledWorkflows.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {activeWorkflows.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active workflows</p>
            ) : (
              activeWorkflows.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  contacts={contacts}
                  onAdvance={() => advanceStatus(workflow.id)}
                  onUpdate={(updates) => updateWorkflow(workflow.id, updates)}
                  onDelete={() => deleteWorkflow(workflow.id)}
                  isSaving={isSaving}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedWorkflows.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed workflows</p>
            ) : (
              completedWorkflows.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  contacts={contacts}
                  onAdvance={() => {}}
                  onUpdate={(updates) => updateWorkflow(workflow.id, updates)}
                  onDelete={() => deleteWorkflow(workflow.id)}
                  isSaving={isSaving}
                  readonly
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3">
            {cancelledWorkflows.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No cancelled workflows</p>
            ) : (
              cancelledWorkflows.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  contacts={contacts}
                  onAdvance={() => {}}
                  onUpdate={(updates) => updateWorkflow(workflow.id, updates)}
                  onDelete={() => deleteWorkflow(workflow.id)}
                  isSaving={isSaving}
                  readonly
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface WorkflowCardProps {
  workflow: EPDRenewalWorkflow;
  contacts: any[];
  onAdvance: () => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  isSaving: boolean;
  readonly?: boolean;
}

function WorkflowCard({ workflow, contacts, onAdvance, onUpdate, onDelete, isSaving, readonly }: WorkflowCardProps) {
  const statusConfig = STATUS_CONFIG[workflow.status];
  const priorityConfig = PRIORITY_CONFIG[workflow.priority];
  const progress = getStatusProgress(workflow.status);
  const contact = contacts.find(c => c.id === workflow.supplier_contact_id);

  const canAdvance = !readonly && workflow.status !== 'completed' && workflow.status !== 'cancelled';

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{workflow.material_name}</span>
            <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {workflow.epd_number && (
              <span>EPD: {workflow.epd_number}</span>
            )}
            {workflow.manufacturer && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {workflow.manufacturer}
              </span>
            )}
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Expires: {format(new Date(workflow.expiry_date), 'PP')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={statusConfig.color}>
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </Badge>
          
          {!readonly && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onUpdate({ status: 'cancelled' })}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Pending</span>
          <span>Contacted</span>
          <span>Requested</span>
          <span>Received</span>
          <span>Verified</span>
          <span>Done</span>
        </div>
      </div>

      {/* Contact info */}
      {contact && (
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{contact.company_name}</span>
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
              {contact.email}
            </a>
          )}
        </div>
      )}

      {/* Notes */}
      {workflow.notes && (
        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
          {workflow.notes}
        </p>
      )}

      {/* Timeline info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {workflow.contact_date && (
          <span>Contacted: {format(new Date(workflow.contact_date), 'PP')}</span>
        )}
        {workflow.request_date && (
          <span>Requested: {format(new Date(workflow.request_date), 'PP')}</span>
        )}
        {workflow.received_date && (
          <span>Received: {format(new Date(workflow.received_date), 'PP')}</span>
        )}
        {workflow.new_epd_number && (
          <span>New EPD: {workflow.new_epd_number}</span>
        )}
      </div>

      {/* Actions */}
      {canAdvance && (
        <div className="flex justify-end pt-2">
          <Button 
            size="sm" 
            onClick={onAdvance}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Advance to {STATUS_CONFIG[STATUS_ORDER[STATUS_ORDER.indexOf(workflow.status) + 1]]?.label}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
