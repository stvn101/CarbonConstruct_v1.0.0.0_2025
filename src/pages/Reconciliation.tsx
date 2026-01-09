import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { useReconciliation } from '@/hooks/useReconciliation';
import { SEOHead } from '@/components/SEOHead';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Upload, CheckCircle, AlertTriangle, Clock, 
  Loader2, Plus, Trash2, ArrowRight, FileSpreadsheet,
  TrendingUp, TrendingDown, Minus, Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import Decimal from 'decimal.js';
import * as XLSX from 'xlsx';

export default function Reconciliation() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    runs,
    runsLoading,
    createRun,
    parseInvoice,
    addInvoiceItems,
    runMatching,
    deleteRun,
  } = useReconciliation();

  const [newRunName, setNewRunName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<Array<{
    lineNumber: number;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number | null;
    totalPrice: number | null;
    category: string | null;
    confidence: number;
  }>>([]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access reconciliation</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </Card>
      </div>
    );
  }

  const handleCreateRun = async () => {
    if (!newRunName.trim()) {
      toast({ title: 'Please enter a name', variant: 'destructive' });
      return;
    }

    // Get BOQ items from localStorage (same as Calculator)
    let boqItems: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      unit: string;
      factor: number;
      source: string;
    }> = [];

    try {
      const stored = localStorage.getItem('calculator-materials');
      if (stored) {
        const parsed = JSON.parse(stored);
        boqItems = parsed.map((m: Record<string, unknown>) => ({
          id: String(m.id || ''),
          name: String(m.name || ''),
          category: String(m.category || ''),
          quantity: Number(m.quantity) || 0,
          unit: String(m.unit || ''),
          factor: Number(m.factor) || 0,
          source: String(m.source || ''),
        }));
      }
    } catch {
      // Ignore
    }

    await createRun.mutateAsync({
      name: newRunName.trim(),
      projectId: currentProject?.id,
      boqItems,
    });

    setNewRunName('');
    setCreateDialogOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedRunId) return;

    setUploadingFile(true);
    try {
      let text = '';
      let fileType = 'csv';

      if (file.name.endsWith('.csv')) {
        text = await file.text();
        fileType = 'csv';
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        text = XLSX.utils.sheet_to_csv(firstSheet);
        fileType = 'xlsx';
      } else if (file.name.endsWith('.txt')) {
        text = await file.text();
        fileType = 'txt';
      } else {
        toast({ title: 'Unsupported file type', variant: 'destructive' });
        return;
      }

      // Parse with AI
      const items = await parseInvoice(text, fileType);
      setParsedItems(items);

      toast({ title: `Extracted ${items.length} line items` });
    } catch (error) {
      toast({ 
        title: 'Failed to parse file', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmItems = async () => {
    if (!selectedRunId || parsedItems.length === 0) return;

    await addInvoiceItems.mutateAsync({
      runId: selectedRunId,
      items: parsedItems,
    });

    // Run matching
    await runMatching.mutateAsync(selectedRunId);

    setParsedItems([]);
    setSelectedRunId(null);
  };

  const formatCurrency = (cents: number | null) => {
    if (cents === null) return '-';
    return new Decimal(cents).div(100).toFixed(2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-300"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4 text-emerald-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <SEOHead 
        title="Invoice Reconciliation" 
        description="Compare delivery tickets and invoices against BOQ estimates to identify variances."
        canonicalPath="/reconciliation"
      />

      {/* Header */}
      <div className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-2 rounded">
              <FileText className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Invoice <span className="text-purple-400">Reconciliation</span>
              </h1>
              <p className="text-xs text-slate-400">Compare estimates vs actuals</p>
            </div>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                New Reconciliation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Reconciliation Run</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Run Name</label>
                  <Input 
                    value={newRunName}
                    onChange={(e) => setNewRunName(e.target.value)}
                    placeholder="e.g., January 2026 Delivery Reconciliation"
                    className="mt-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  This will snapshot your current BOQ from the Calculator for comparison.
                </p>
                <Button 
                  onClick={handleCreateRun} 
                  className="w-full"
                  disabled={createRun.isPending}
                >
                  {createRun.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Run
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto mt-8 px-4">
        {runsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : runs?.length === 0 ? (
          <Card className="p-12 text-center">
            <FileSpreadsheet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Reconciliation Runs</h2>
            <p className="text-muted-foreground mb-6">
              Create a reconciliation run to compare your BOQ estimates with actual delivery tickets and invoices.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Run
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {runs?.map((run) => (
              <Card key={run.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{run.name}</h3>
                      {getStatusBadge(run.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(run.created_at).toLocaleDateString()}
                    </p>
                    
                    {run.status === 'completed' && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="text-2xl font-bold">{run.total_invoice_items}</div>
                          <div className="text-xs text-muted-foreground">Invoice Items</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3">
                          <div className="text-2xl font-bold text-emerald-600">{run.matched_items}</div>
                          <div className="text-xs text-emerald-700">Matched</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                          <div className="text-2xl font-bold text-amber-600">{run.unmatched_items}</div>
                          <div className="text-xs text-amber-700">Unmatched</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 flex items-center gap-2">
                          {getVarianceIcon(run.total_variance_carbon_kg)}
                          <div>
                            <div className="text-xl font-bold">
                              {run.total_variance_carbon_kg > 0 ? '+' : ''}
                              {(run.total_variance_carbon_kg / 1000).toFixed(2)} t
                            </div>
                            <div className="text-xs text-muted-foreground">Carbon Variance</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {run.status === 'pending' && (
                      <div className="mt-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedRunId(run.id);
                            fileInputRef.current?.click();
                          }}
                          disabled={uploadingFile}
                        >
                          {uploadingFile && selectedRunId === run.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Upload Invoice/Delivery Ticket
                        </Button>
                      </div>
                    )}
                    
                    {run.status === 'processing' && (
                      <div className="mt-4">
                        <Progress value={50} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Matching in progress...</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {run.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Report
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteRun.mutate(run.id)}
                      disabled={deleteRun.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Parsed Items Preview Dialog */}
        {parsedItems.length > 0 && (
          <Dialog open={true} onOpenChange={() => setParsedItems([])}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Extracted Line Items ({parsedItems.length})</DialogTitle>
              </DialogHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.lineNumber}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                      <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right font-mono">
                        ${formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${formatCurrency(item.totalPrice)}
                      </TableCell>
                      <TableCell>
                        {item.category && (
                          <Badge variant="outline">{item.category}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setParsedItems([])}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmItems}
                  disabled={addInvoiceItems.isPending || runMatching.isPending}
                >
                  {addInvoiceItems.isPending || runMatching.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Confirm & Run Matching
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
