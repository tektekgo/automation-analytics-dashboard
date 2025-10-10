import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface FileUploadProps {
  onFileLoad: (data: any[], headers: string[], fileName: string) => void;
}

export const FileUpload = ({ onFileLoad }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: true });
        
        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1);
          setFileName(file.name);
          onFileLoad(rows, headers, file.name);
        }
      } catch (error) {
        console.error("Error processing file:", error);
      }
    };
    reader.readAsBinaryString(file);
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleClear = () => {
    setFileName(null);
    onFileLoad([], [], "");
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300",
          isDragging ? "border-primary bg-primary/5 scale-105" : "border-border bg-card hover:border-primary/50",
          fileName && "border-primary bg-primary/5"
        )}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />
        
        <div className="flex flex-col items-center gap-4">
          {fileName ? (
            <>
              <FileSpreadsheet className="w-16 h-16 text-primary" />
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-card-foreground">{fileName}</p>
                <button
                  onClick={handleClear}
                  className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-5 h-5 text-destructive" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">File loaded successfully</p>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-muted-foreground" />
              <div>
                <p className="text-xl font-semibold text-card-foreground mb-2">
                  Drop your Excel file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse • Supports .xlsx and .xls files
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
