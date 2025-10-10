import { useState } from "react";
import { ChevronDown, ChevronUp, FileSpreadsheet } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { DataPreview } from "@/components/DataPreview";

interface CollapsibleDataSectionProps {
  data: any[];
  headers: string[];
  fileName: string;
  onFileLoad: (data: any[], headers: string[], fileName: string) => void;
}

export const CollapsibleDataSection = ({
  data,
  headers,
  fileName,
  onFileLoad,
}: CollapsibleDataSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-6 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div className="text-left">
                <h2 className="text-xl font-bold text-card-foreground">
                  Data Source
                </h2>
                {fileName && data.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {fileName} • {data.length} rows loaded
                  </p>
                )}
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-6 p-6 pt-0">
            <FileUpload onFileLoad={onFileLoad} />
            {data.length > 0 && <DataPreview data={data} headers={headers} />}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
