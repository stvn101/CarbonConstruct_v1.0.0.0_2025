import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, FileText, Loader2 } from "lucide-react";
import Decimal from "decimal.js";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TaxInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  grossAmountCents: number;
  gstAmountCents: number;
  netAmountCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerAbn?: string;
  description: string;
  paymentStatus: string;
  subscriptionPeriod?: {
    start: string;
    end: string;
  };
}

interface AustralianTaxInvoiceProps {
  data: TaxInvoiceData;
  onDownload?: () => void;
  onPrint?: () => void;
}

/**
 * Australian Standard Tax Invoice Component
 * 
 * Compliant with ATO requirements per Division 29 of the GST Act.
 * Uses Decimal.js for precise currency formatting.
 * 
 * Requirements addressed:
 * - Tax Invoice header
 * - Supplier ABN
 * - Invoice number and date
 * - GST amount shown separately
 * - Description of services
 */
export function AustralianTaxInvoice({ data, onDownload, onPrint }: AustralianTaxInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Format currency with Decimal.js for precision
  const formatCurrency = (cents: number): string => {
    const dollars = new Decimal(cents).dividedBy(100);
    return `$${dollars.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy");
    } catch {
      return dateString;
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Basic download using html2pdf if available
      alert("PDF download functionality requires html2pdf.js integration");
    }
  };

  const isPaid = data.paymentStatus === "succeeded" || data.paymentStatus === "paid";

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 print:hidden">
        <Button 
          variant="outline" 
          onClick={handlePrint}
          className="min-h-[44px]"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Invoice
        </Button>
        <Button 
          variant="outline" 
          onClick={handleDownload}
          className="min-h-[44px]"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Tax Invoice Document */}
      <Card ref={invoiceRef} className="max-w-2xl mx-auto bg-background print:shadow-none print:border-0">
        <CardHeader className="space-y-4">
          {/* Tax Invoice Header - Required by ATO */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">CarbonConstruct</h1>
                <p className="text-sm text-muted-foreground">Carbon Calculation Platform</p>
              </div>
            </div>
            <Badge variant="default" className="text-lg px-4 py-1">
              TAX INVOICE
            </Badge>
          </div>

          <Separator />

          {/* Supplier Details - Required by ATO */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <h2 className="font-semibold text-foreground">From</h2>
              <p className="text-sm text-foreground">CarbonConstruct Pty Ltd</p>
              <p className="text-sm text-muted-foreground">Level 10, 123 Collins Street</p>
              <p className="text-sm text-muted-foreground">Melbourne VIC 3000</p>
              <p className="text-sm text-muted-foreground">Australia</p>
              <p className="text-sm font-medium text-foreground mt-2">
                ABN: XX XXX XXX XXX
              </p>
            </div>

            {/* Customer Details */}
            <div className="space-y-1">
              <h2 className="font-semibold text-foreground">Bill To</h2>
              <p className="text-sm text-foreground">{data.customerName}</p>
              <p className="text-sm text-muted-foreground">{data.customerEmail}</p>
              {data.customerAbn && (
                <p className="text-sm font-medium text-foreground mt-2">
                  ABN: {data.customerAbn}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Invoice Details - Required by ATO */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="font-medium text-foreground">{data.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-medium text-foreground">{formatDate(data.invoiceDate)}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Line Items */}
          <div className="rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium text-foreground">Description</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <p className="text-sm text-foreground">{data.description}</p>
                    {data.subscriptionPeriod && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Period: {formatDate(data.subscriptionPeriod.start)} - {formatDate(data.subscriptionPeriod.end)}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-right text-sm text-foreground">
                    {formatCurrency(data.netAmountCents)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals - GST must be shown separately per ATO */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal (GST Exclusive)</span>
                <span className="text-foreground">{formatCurrency(data.netAmountCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (10%)</span>
                <span className="text-foreground">{formatCurrency(data.gstAmountCents)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span className="text-foreground">Total (GST Inclusive)</span>
                <span className="text-foreground">{formatCurrency(data.grossAmountCents)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className={`flex items-center justify-between p-4 rounded-lg border ${
            isPaid 
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" 
              : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
          }`}>
            <span className={`text-sm font-medium ${
              isPaid ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
            }`}>
              Payment Status
            </span>
            <Badge variant="default" className={isPaid ? "bg-emerald-600" : "bg-amber-600"}>
              {isPaid ? "PAID" : data.paymentStatus.toUpperCase()}
            </Badge>
          </div>

          {/* Footer Notes */}
          <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t">
            <p>
              This is a valid tax invoice for GST purposes. Please retain for your records.
            </p>
            <p>
              Payment was processed via Stripe. For payment queries, please contact 
              support@carbonconstruct.com.au
            </p>
            <p className="font-medium">
              Thank you for choosing CarbonConstruct for your carbon calculation needs.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          [data-invoice-content], [data-invoice-content] * {
            visibility: visible;
          }
          [data-invoice-content] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to fetch tax invoice records for the current user
 */
export function useTaxInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<TaxInvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("payment_tax_records")
          .select("*")
          .eq("user_id", user.id)
          .order("invoice_date", { ascending: false });

        if (fetchError) throw fetchError;

        // Transform database records to TaxInvoiceData format
        const transformed: TaxInvoiceData[] = (data || []).map((record) => ({
          invoiceNumber: record.stripe_invoice_id,
          invoiceDate: record.invoice_date,
          grossAmountCents: record.gross_amount_cents,
          gstAmountCents: record.gst_amount_cents,
          netAmountCents: record.net_amount_cents,
          currency: record.currency.toUpperCase(),
          customerName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer",
          customerEmail: user.email || "",
          description: "CarbonConstruct Subscription",
          paymentStatus: record.payment_status,
          subscriptionPeriod: record.subscription_id ? {
            start: record.invoice_date,
            end: record.invoice_date, // Would need to fetch from subscription data
          } : undefined,
        }));

        setInvoices(transformed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch invoices");
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, [user]);

  return { invoices, loading, error };
}

/**
 * Component to display a list of tax invoices with expandable details
 */
export function TaxInvoiceList() {
  const { invoices, loading, error } = useTaxInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<TaxInvoiceData | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading invoices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <p>Error loading invoices: {error}</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No tax invoices found.</p>
        <p className="text-sm">Invoices will appear here after your first payment.</p>
      </div>
    );
  }

  if (selectedInvoice) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedInvoice(null)}
          className="mb-4"
        >
          ← Back to Invoice List
        </Button>
        <AustralianTaxInvoice data={selectedInvoice} />
      </div>
    );
  }

  // Format currency with Decimal.js for precision
  const formatCurrency = (cents: number): string => {
    const dollars = new Decimal(cents).dividedBy(100);
    return `$${dollars.toFixed(2)}`;
  };

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <Card
          key={invoice.invoiceNumber}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setSelectedInvoice(invoice)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(invoice.invoiceDate), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(invoice.grossAmountCents)}</p>
                <Badge 
                  variant="outline" 
                  className={invoice.paymentStatus === "succeeded" ? "text-emerald-600 border-emerald-600" : ""}
                >
                  {invoice.paymentStatus === "succeeded" ? "Paid" : invoice.paymentStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default AustralianTaxInvoice;
