import { memo, useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, FileText, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface BOQUploaderProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_FILE_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'application/pdf': ['.pdf'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const BOQUploader = memo(({ onFileUpload, disabled = false }: BOQUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }

    // Check file type
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isValidType = Object.values(ACCEPTED_FILE_TYPES)
      .flat()
      .includes(extension);

    if (!isValidType) {
      return `Invalid file type. Please upload Excel (.xlsx, .xls), CSV (.csv), or PDF (.pdf) files.`;
    }

    return null;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setUploadProgress(0);
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = useCallback(() => {
    if (!selectedFile) return;

    // Simulate upload progress
    setUploadProgress(20);
    setTimeout(() => setUploadProgress(50), 200);
    setTimeout(() => setUploadProgress(80), 400);
    setTimeout(() => {
      setUploadProgress(100);
      onFileUpload(selectedFile);
    }, 600);
  }, [selectedFile, onFileUpload]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(0);
    setError(null);
  }, []);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
      case 'pdf':
        return <FileText className="h-12 w-12 text-red-500" />;
      default:
        return <File className="h-12 w-12 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-all duration-200',
          isDragging && !disabled && 'border-primary bg-primary/5 scale-[1.02]',
          !isDragging && !disabled && 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive'
        )}
      >
        <input
          type="file"
          id="boq-upload"
          accept={Object.keys(ACCEPTED_FILE_TYPES).join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
          <Upload className={cn(
            'h-16 w-16 transition-colors',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} />

          <div className="text-center">
            <p className="text-lg font-semibold">
              {isDragging ? 'Drop file here' : 'Drag & drop your BOQ file'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse
            </p>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Supported formats: Excel (.xlsx, .xls), CSV, PDF</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !error && (
        <div className="p-4 bg-muted rounded-lg space-y-4">
          <div className="flex items-center gap-4">
            {getFileIcon(selectedFile.name)}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={uploadProgress > 0 && uploadProgress < 100}
            >
              Clear
            </Button>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {uploadProgress === 0 && (
            <Button
              onClick={handleUpload}
              disabled={disabled}
              className="w-full"
              size="lg"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload & Process BOQ
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

BOQUploader.displayName = 'BOQUploader';
