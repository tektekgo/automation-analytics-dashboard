import { useState } from "react";
import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { DataSlicer, FilterConfig } from "@/components/DataSlicer";
import { ViewModeSelector, ViewMode } from "@/components/ViewModeSelector";
import { ExportControls } from "@/components/ExportControls";

interface CollapsibleControlsSectionProps {
  headers: string[];
  data: any[];
  fileName: string;
  viewMode: ViewMode;
  onFilter: (filterConfig: FilterConfig) => void;
  onViewModeChange: (mode: ViewMode) => void;
  hasPeriodData: boolean;
}

export const CollapsibleControlsSection = ({
  headers,
  data,
  fileName,
  viewMode,
  onFilter,
  onViewModeChange,
  hasPeriodData,
}: CollapsibleControlsSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-10">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-l-none rounded-r-lg shadow-lg bg-card border-l-0"
            onClick={() => setIsOpen(true)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative space-y-6">
        <div className="absolute -right-3 top-0 z-10">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg bg-card h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-card-foreground">Controls</h3>
            </div>
            <div className="space-y-6">
              <DataSlicer headers={headers} onFilter={onFilter} />
              <ViewModeSelector
                value={viewMode}
                onChange={onViewModeChange}
                hasPeriodData={hasPeriodData}
              />
              <ExportControls
                data={data}
                headers={headers}
                fileName={fileName}
                viewMode={viewMode}
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
