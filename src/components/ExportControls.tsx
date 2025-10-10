import { Download, FileSpreadsheet, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { toast } from "sonner";

interface ExportControlsProps {
  data: any[];
  headers: string[];
  fileName: string;
}

export const ExportControls = ({ data, headers, fileName }: ExportControlsProps) => {
  const handleExportToExcel = async () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Add data sheet
      const dataSheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      XLSX.utils.book_append_sheet(workbook, dataSheet, "Data");
      
      // Export workbook
      XLSX.writeFile(workbook, `${fileName.replace(/\.[^/.]+$/, "")}_export.xlsx`);
      toast.success("Excel file exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export Excel file");
    }
  };

  const handleExportChartAsImage = async (chartId: string, chartName: string) => {
    try {
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        toast.error(`Chart ${chartName} not found`);
        return;
      }

      const canvas = await html2canvas(chartElement, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${chartName}.png`);
          toast.success(`${chartName} exported as PNG!`);
        }
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export ${chartName}`);
    }
  };

  const handleExportAllCharts = async () => {
    const charts = [
      { id: "cost-bar-chart", name: "Cost_Savings_Chart" },
      { id: "time-bar-chart", name: "Time_Savings_Chart" },
      { id: "trend-line-chart", name: "Savings_Trend_Chart" },
      { id: "cost-pie-chart", name: "Cost_Distribution_Chart" },
      { id: "roi-chart", name: "ROI_Analysis_Chart" },
    ];

    for (const chart of charts) {
      await handleExportChartAsImage(chart.id, chart.name);
      // Add small delay between exports
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (!data.length || !headers.length) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-card-foreground">Export Options</h3>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleExportToExcel}
          variant="gradient"
          className="w-full"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>

        <Button
          onClick={handleExportAllCharts}
          variant="default"
          className="w-full"
        >
          <Image className="w-4 h-4 mr-2" />
          Export All Charts as PNG
        </Button>

        <div className="pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Export Individual Charts:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleExportChartAsImage("cost-bar-chart", "Cost_Savings")}
              variant="outline"
              size="sm"
            >
              Cost Savings
            </Button>
            <Button
              onClick={() => handleExportChartAsImage("time-bar-chart", "Time_Savings")}
              variant="outline"
              size="sm"
            >
              Time Savings
            </Button>
            <Button
              onClick={() => handleExportChartAsImage("trend-line-chart", "Trend_Analysis")}
              variant="outline"
              size="sm"
            >
              Trend Analysis
            </Button>
            <Button
              onClick={() => handleExportChartAsImage("cost-pie-chart", "Distribution")}
              variant="outline"
              size="sm"
            >
              Distribution
            </Button>
            <Button
              onClick={() => handleExportChartAsImage("roi-chart", "ROI_Analysis")}
              variant="outline"
              size="sm"
            >
              ROI Analysis
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
