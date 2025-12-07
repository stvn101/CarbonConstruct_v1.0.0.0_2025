import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function DataExportButton() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!user) {
      toast.error("You must be logged in to export your data");
      return;
    }

    setIsExporting(true);

    try {
      const { data, error } = await supabase.functions.invoke("export-user-data");

      if (error) {
        throw error;
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carbonconstruct-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Your data has been exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export your data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) return null;

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export My Data
        </>
      )}
    </Button>
  );
}
