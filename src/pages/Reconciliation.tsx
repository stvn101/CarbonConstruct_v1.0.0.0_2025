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
  TrendingUp, TrendingDown, Minus, FileDown
} from 'lucide-react';
import { default as SecureHtml2Pdf } from '@/lib/secure-html-to-pdf';
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReportRun, setSelectedReportRun] = useState<NonNullable<typeof runs>[0] | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
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

  const getVarianceIcon = (variance: number | null) => {
    if (variance === null) return <Minus className="h-4 w-4 text-gray-400" />;
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4 text-emerald-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const generateReconciliationPDF = async (run: NonNullable<typeof runs>[0]) => {
    setIsGeneratingPDF(true);
    setSelectedReportRun(run);
    setReportDialogOpen(true);
    
    // Wait for the dialog to render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const element = reportRef.current;
      if (!element) {
        throw new Error('Report element not found');
      }
      
      // Add pdf-exporting class for high-contrast print styles
      document.documentElement.classList.add('pdf-exporting');
      
      await SecureHtml2Pdf()
        .set({
          margin: 10,
          filename: `Reconciliation-${run.name.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
      
      toast({ title: 'PDF Downloaded', description: 'Reconciliation report saved successfully' });
    } catch (error) {
      toast({ 
        title: 'PDF Generation Failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      document.documentElement.classList.remove('pdf-exporting');
      setIsGeneratingPDF(false);
      setReportDialogOpen(false);
    }
  };

  // Reconciliation Report Content Component for PDF
  const ReconciliationReportContent = ({ run }: { run: NonNullable<typeof runs>[0] }) => {
    const carbonVarianceT = new Decimal(run.total_variance_carbon_kg || 0).div(1000);
    const costVariance = new Decimal(run.total_variance_cost_cents || 0).div(100);
    const matchRate = run.total_invoice_items 
      ? new Decimal(run.matched_items || 0).div(run.total_invoice_items).mul(100).toFixed(1)
      : '0';
    
    return (
      <div ref={reportRef} className="bg-white text-black p-8 min-h-[297mm] w-[210mm]">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Invoice Reconciliation Report</h1>
          <p className="text-gray-600">{run.name}</p>
          <p className="text-sm text-gray-500">Generated: {new Date().toLocaleDateString('en-AU')}</p>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-gray-300 rounded p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Matching Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Invoice Items:</span>
                <span className="font-medium">{run.total_invoice_items || 0}</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Matched Items:</span>
                <span className="font-medium">{run.matched_items || 0}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Unmatched Items:</span>
                <span className="font-medium">{run.unmatched_items || 0}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span>Match Rate:</span>
                <span className="font-bold">{matchRate}%</span>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-300 rounded p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Variance Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Carbon Variance:</span>
                <span className={`font-medium ${carbonVarianceT.greaterThan(0) ? 'text-red-700' : 'text-green-700'}`}>
                  {carbonVarianceT.greaterThan(0) ? '+' : ''}{carbonVarianceT.toFixed(3)} tCO₂e
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cost Variance:</span>
                <span className={`font-medium ${costVariance.greaterThan(0) ? 'text-red-700' : 'text-green-700'}`}>
                  {costVariance.greaterThan(0) ? '+' : ''}${costVariance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Quantity Variance:</span>
                <span className="font-medium">
                  {run.total_variance_quantity ? `${run.total_variance_quantity > 0 ? '+' : ''}${run.total_variance_quantity.toFixed(1)}` : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status & Dates */}
        <div className="mb-6 text-sm">
          <div className="flex gap-8">
            <div>
              <span className="text-gray-600">Status: </span>
              <span className="font-medium capitalize">{run.status}</span>
            </div>
            <div>
              <span className="text-gray-600">Created: </span>
              <span>{new Date(run.created_at).toLocaleDateString('en-AU')}</span>
            </div>
            <div>
              <span className="text-gray-600">Last Updated: </span>
              <span>{new Date(run.updated_at).toLocaleDateString('en-AU')}</span>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        {run.notes && (
          <div className="mb-6 border border-gray-200 rounded p-3 bg-gray-50">
            <h4 className="font-medium text-gray-700 mb-1">Notes</h4>
            <p className="text-sm text-gray-600">{run.notes}</p>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500">
          <p>CarbonConstruct Pro Edition | ABN: 12 345 678 901</p>
          <p>This report is for internal use only. Carbon calculations include 10% GST where applicable.</p>
        </div>
      </div>
    );
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
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            .csv
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            .xlsx
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            .xls
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                            .txt
                          </span>
                        </div>
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateReconciliationPDF(run)}
                        disabled={isGeneratingPDF}
                      >
                        {isGeneratingPDF ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <FileDown className="h-4 w-4 mr-1" />
                        )}
                        Download PDF
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
        
        {/* Hidden PDF Report Content */}
        {reportDialogOpen && selectedReportRun && (
          <div className="fixed left-[-9999px] top-0">
            <ReconciliationReportContent run={selectedReportRun} />
          </div>
        )}
      </main>
    </div>
  );
}
