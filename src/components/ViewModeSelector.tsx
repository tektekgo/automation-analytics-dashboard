import { Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ViewMode = "forecast" | "period-tracking" | "forecast-vs-actual";

interface ViewModeSelectorProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  hasPeriodData: boolean;
}

export const ViewModeSelector = ({ value, onChange, hasPeriodData }: ViewModeSelectorProps) => {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-foreground">View Mode:</label>
      <Select value={value} onValueChange={(v) => onChange(v as ViewMode)}>
        <SelectTrigger className="w-[240px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="forecast">Forecast View</SelectItem>
          <SelectItem value="period-tracking" disabled={!hasPeriodData}>
            Period Tracking {!hasPeriodData && "⚠️"}
          </SelectItem>
          <SelectItem value="forecast-vs-actual" disabled={!hasPeriodData}>
            Forecast vs Actual {!hasPeriodData && "⚠️"}
          </SelectItem>
        </SelectContent>
      </Select>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[320px] p-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Forecast View:</span> Shows forecasted savings values
              </div>
              <div>
                <span className="font-semibold">Period Tracking:</span> Shows actual period data with trends over time
              </div>
              <div>
                <span className="font-semibold">Forecast vs Actual:</span> Compares forecasted vs actual performance
              </div>
              {!hasPeriodData && (
                <div className="pt-2 mt-2 border-t border-border text-yellow-600 dark:text-yellow-400">
                  <span className="font-semibold">Note:</span> Add "Reporting Period", "Reporting Period Cost Savings", 
                  and "Reporting Period Time Savings" columns to enable tracking views
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
