import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface DataSlicerProps {
  headers: string[];
  onFilter: (filters: FilterConfig) => void;
}

export interface FilterConfig {
  column: string;
  value: string;
  dateFrom?: string;
  dateTo?: string;
}

export const DataSlicer = ({ headers, onFilter }: DataSlicerProps) => {
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<FilterConfig[]>([]);

  const handleApplyFilter = () => {
    if (!selectedColumn || !filterValue) return;
    
    const newFilter: FilterConfig = {
      column: selectedColumn,
      value: filterValue,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
    
    const updatedFilters = [...activeFilters, newFilter];
    setActiveFilters(updatedFilters);
    onFilter(newFilter);
    
    // Reset form
    setFilterValue("");
    setDateFrom("");
    setDateTo("");
  };

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(updatedFilters);
    if (updatedFilters.length > 0) {
      onFilter(updatedFilters[updatedFilters.length - 1]);
    } else {
      onFilter({ column: "", value: "" });
    }
  };

  if (!headers.length) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-card-foreground">Data Filters</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="column-select" className="text-sm font-medium mb-2 block">
            Select Column
          </Label>
          <Select value={selectedColumn} onValueChange={setSelectedColumn}>
            <SelectTrigger id="column-select">
              <SelectValue placeholder="Choose a column" />
            </SelectTrigger>
            <SelectContent>
              {headers.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="filter-value" className="text-sm font-medium mb-2 block">
            Filter Value
          </Label>
          <Input
            id="filter-value"
            placeholder="Enter value to filter"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date-from" className="text-sm font-medium mb-2 block">
              Date From (Optional)
            </Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="date-to" className="text-sm font-medium mb-2 block">
              Date To (Optional)
            </Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleApplyFilter}
          disabled={!selectedColumn || !filterValue}
          variant="gradient"
          className="w-full"
        >
          Apply Filter
        </Button>

        {activeFilters.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium">Active Filters:</Label>
            {activeFilters.map((filter, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-primary/10 rounded-lg"
              >
                <span className="text-sm">
                  <strong>{filter.column}</strong>: {filter.value}
                  {filter.dateFrom && ` (${filter.dateFrom} - ${filter.dateTo})`}
                </span>
                <button
                  onClick={() => handleRemoveFilter(idx)}
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
