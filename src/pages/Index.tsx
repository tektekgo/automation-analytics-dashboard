import { useState } from "react";
import { CollapsibleDataSection } from "@/components/CollapsibleDataSection";
import { CollapsibleControlsSection } from "@/components/CollapsibleControlsSection";
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import { FilterConfig } from "@/components/DataSlicer";
import { ViewMode } from "@/components/ViewModeSelector";
import { BarChart3 } from "lucide-react";

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [filters, setFilters] = useState<FilterConfig>({ column: "", value: "" });
  const [viewMode, setViewMode] = useState<ViewMode>("forecast");

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
              Ansible Automation Analytics Dashboard
            </h1>
          </div>
          <p className="text-center text-primary-foreground/90 mt-2">
            Infrastructure Automation and DevOps Engineering
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Collapsible Data Section */}
          <section>
            <CollapsibleDataSection
              data={data}
              headers={headers}
              fileName={fileName}
              onFileLoad={handleFileLoad}
            />
          </section>

          {/* Controls and Dashboard Section */}
          {data.length > 0 && (
            <section className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
              <CollapsibleControlsSection
                headers={headers}
                data={data}
                fileName={fileName}
                viewMode={viewMode}
                onFilter={handleFilter}
                onViewModeChange={setViewMode}
                hasPeriodData={headers.some(h => h?.toLowerCase().includes('reporting') && h?.toLowerCase().includes('period'))}
              />
              
              <div>
                <ExecutiveDashboard data={data} headers={headers} filters={filters} viewMode={viewMode} />
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Crafted by Sujit Gangadharan • Built with React, TypeScript, and Recharts
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
