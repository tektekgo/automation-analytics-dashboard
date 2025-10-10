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
    <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <h2 className="text-2xl font-bold text-card-foreground">Data Preview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Showing {displayData.length} of {data.length} rows
        </p>
      </div>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, idx) => (
                <TableHead key={idx} className="font-semibold text-foreground">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                {headers.map((_, colIdx) => (
                  <TableCell key={colIdx}>{row[colIdx]?.toString() || "-"}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
