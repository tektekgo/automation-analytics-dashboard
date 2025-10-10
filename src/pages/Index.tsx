import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { DataPreview } from "@/components/DataPreview";
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import { DataSlicer, FilterConfig } from "@/components/DataSlicer";
import { ExportControls } from "@/components/ExportControls";
import { BarChart3 } from "lucide-react";

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [filters, setFilters] = useState<FilterConfig>({ column: "", value: "" });

  const handleFileLoad = (loadedData: any[], loadedHeaders: string[], name: string) => {
    setData(loadedData);
    setHeaders(loadedHeaders);
    setFileName(name);
  };

  const handleFilter = (filterConfig: FilterConfig) => {
    setFilters(filterConfig);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <BarChart3 className="w-10 h-10 text-primary-foreground" />
            <h1 className="text-4xl font-bold text-primary-foreground">
              Excel Analytics Dashboard
            </h1>
          </div>
          <p className="text-center text-primary-foreground/90 mt-2">
            Upload, Analyze, and Export Your Data with Beautiful Visualizations
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* File Upload Section */}
          <section>
            <FileUpload onFileLoad={handleFileLoad} />
          </section>

          {/* Data Preview Section */}
          {data.length > 0 && (
            <>
              <section>
                <DataPreview data={data} headers={headers} />
              </section>

              {/* Controls and Dashboard Section */}
              <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <DataSlicer headers={headers} onFilter={handleFilter} />
                  <ExportControls data={data} headers={headers} fileName={fileName} />
                </div>
                
                <div className="lg:col-span-3">
                  <ExecutiveDashboard data={data} headers={headers} filters={filters} />
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Built with React, TypeScript, and Recharts • No backend required
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
