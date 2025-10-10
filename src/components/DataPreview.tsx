import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataPreviewProps {
  data: any[];
  headers: string[];
}

export const DataPreview = ({ data, headers }: DataPreviewProps) => {
  if (!data.length || !headers.length) return null;

  const displayData = data.slice(0, 10);

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
        <h2 className="text-xl font-bold text-card-foreground">Data Preview</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Showing {displayData.length} of {data.length} rows
        </p>
      </div>
      <ScrollArea className="h-[350px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {headers.map((header, idx) => (
                <TableHead key={idx} className="font-semibold text-foreground text-xs h-9 px-3">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIdx) => (
              <TableRow key={rowIdx} className="hover:bg-muted/30">
                {headers.map((_, colIdx) => (
                  <TableCell key={colIdx} className="text-sm py-2 px-3">{row[colIdx]?.toString() || "-"}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
