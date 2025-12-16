import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BOQUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

const ACCEPTED_FILE_TYPES = [
  ".xlsx",
  ".xls",
  ".csv",
  ".pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function BOQUploader({ onFileSelect, isProcessing = false }: BOQUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ACCEPTED_FILE_TYPES.some((type) => type.includes(extension))) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel (.xlsx, .xls), CSV, or PDF file",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Upload Bill of Quantities (BOQ)
        </CardTitle>
        <CardDescription>
          Upload your BOQ file to automatically extract materials and calculate embodied carbon.
          Supports Excel (.xlsx, .xls), CSV, and PDF formats.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>

            {!selectedFile ? (
              <>
                <div>
                  <p className="text-sm font-medium">
                    Drag and drop your BOQ file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum file size: 10MB
                  </p>
                </div>

                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      Choose File
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        accept={ACCEPTED_FILE_TYPES.join(",")}
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        disabled={isProcessing}
                      />
                    </span>
                  </Button>
                </label>
              </>
            ) : (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? "Processing..." : "Process BOQ File"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                AI-Powered Material Extraction
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Our AI will automatically extract materials from your BOQ and match them with
                verified Environmental Product Declarations (EPDs) for accurate carbon calculations.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
