import { useMemo, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ChartCard } from "./ChartCard";
import { KPICard } from "./KPICard";
import { DollarSign, Clock, TrendingUp, Zap, TrendingDown } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { ViewMode } from "./ViewModeSelector";
import { Alert, AlertDescription } from "./ui/alert";
import { Info } from "lucide-react";

interface ExecutiveDashboardProps {
  data: any[];
  headers: string[];
  filters: any;
  viewMode: ViewMode;
}

const CHART_COLORS = {
  blue: "#336699",
  green: "#10b981", 
  yellow: "#f59e0b",
  orange: "#f97316",
  purple: "#8b5cf6"
};

const COLORS = [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.yellow, CHART_COLORS.orange, CHART_COLORS.purple];

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatHours = (hours: number) => {
  if (hours >= 8760) { // Hours in a year
    return `${(hours / 8760).toFixed(1)} Years`;
  } else if (hours >= 730) { // Hours in a month
    return `${(hours / 730).toFixed(1)} Months`;
  } else if (hours >= 168) { // Hours in a week
    return `${(hours / 168).toFixed(1)} Weeks`;
  }
  return `${hours.toFixed(0)} Hours`;
};

export const ExecutiveDashboard = ({ data, headers, filters, viewMode }: ExecutiveDashboardProps) => {
  const [selectedUseCases, setSelectedUseCases] = useState<number[]>([]);
  
  // Detect period tracking columns
  const periodColumns = useMemo(() => {
    const reportingPeriodIdx = headers.findIndex(h => {
      const lower = h?.toLowerCase() || '';
      return (lower.includes('reporting') && lower.includes('period')) || 
             lower === 'period' || lower === 'month';
    });
    
    const periodCostIdx = headers.findIndex(h => {
      const lower = h?.toLowerCase() || '';
      return (lower.includes('reporting') || lower.includes('period') || lower.includes('monthly')) && 
             (lower.includes('cost') && lower.includes('saving'));
    });
    
    const periodTimeIdx = headers.findIndex(h => {
      const lower = h?.toLowerCase() || '';
      return (lower.includes('reporting') || lower.includes('period') || lower.includes('monthly')) && 
             (lower.includes('time') && lower.includes('saving'));
    });
    
    return {
      reportingPeriodIdx,
      periodCostIdx,
      periodTimeIdx,
      hasPeriodData: reportingPeriodIdx >= 0 && periodCostIdx >= 0 && periodTimeIdx >= 0
    };
  }, [headers]);
  
  const filteredData = useMemo(() => {
    if (!filters.column || !filters.value) return data;
    
    const columnIndex = headers.indexOf(filters.column);
    if (columnIndex === -1) return data;

    return data.filter((row) => {
      const cellValue = row[columnIndex]?.toString().toLowerCase();
      return cellValue?.includes(filters.value.toLowerCase());
    });
  }, [data, headers, filters]);

  const metrics = useMemo(() => {
    if (!filteredData.length || !headers.length) return null;

    // Detect forecast columns
    const forecastTimeSavingsIdx = headers.findIndex(h => {
      const lower = h?.toLowerCase() || '';
      return ((lower.includes('forecast') || lower.includes('yearly')) && 
              lower.includes('time') && lower.includes('saving')) ||
             lower === 'forecasted yearly time savings (hrs)';
    });
    
    const forecastCostSavingsIdx = headers.findIndex(h => {
      const lower = h?.toLowerCase() || '';
      return ((lower.includes('forecast') || lower.includes('yearly')) && 
              lower.includes('cost') && lower.includes('saving')) ||
             lower === 'forecasted yearly cost savings($)';
    });
    
    // Fallback to any time/cost savings columns if no forecast columns found
    const timeSavingsIdx = forecastTimeSavingsIdx >= 0 ? forecastTimeSavingsIdx : headers.findIndex(h => {
      const lower = h?.toLowerCase() || '';
      return (lower.includes('time') && lower.includes('saving')) || 
             lower.includes('timesaving') ||
             lower === 'time savings';
    });
    
    const costSavingsIdx = forecastCostSavingsIdx >= 0 ? forecastCostSavingsIdx : headers.findIndex(h => {
      const lower = h?.toLowerCase() || '';
      return (lower.includes('cost') && lower.includes('saving')) || 
             lower.includes('costsaving') ||
             lower === 'cost savings';
    });

    let totalTimeSavings = 0;
    let totalCostSavings = 0;
    let totalPeriodTime = 0;
    let totalPeriodCost = 0;
    let automationCount = 0;
    let periodTrends = { costTrend: 0, timeTrend: 0 };
    
    // For period tracking, group by use case and get latest period
    if (viewMode !== "forecast" && periodColumns.hasPeriodData) {
      const useCaseMap = new Map<string, any[]>();
      
      // Group rows by use case name
      filteredData.forEach((row) => {
        const useCaseName = row[0]?.toString() || '';
        if (!useCaseMap.has(useCaseName)) {
          useCaseMap.set(useCaseName, []);
        }
        useCaseMap.get(useCaseName)!.push(row);
      });
      
      automationCount = useCaseMap.size;
      
      // For each use case, get the most recent periods
      useCaseMap.forEach((rows) => {
        // Sort by reporting period descending
        const sorted = rows.sort((a, b) => {
          const periodA = a[periodColumns.reportingPeriodIdx]?.toString() || '';
          const periodB = b[periodColumns.reportingPeriodIdx]?.toString() || '';
          return periodB.localeCompare(periodA);
        });
        
        const latest = sorted[0];
        const previous = sorted[1];
        
        // Get period actuals from latest row
        if (periodColumns.periodTimeIdx >= 0) {
          const timeValue = parseFloat(String(latest[periodColumns.periodTimeIdx]).replace(/[^0-9.-]/g, '')) || 0;
          totalPeriodTime += timeValue;
        }
        
        if (periodColumns.periodCostIdx >= 0) {
          const costValue = parseFloat(String(latest[periodColumns.periodCostIdx]).replace(/[^0-9.-]/g, '')) || 0;
          totalPeriodCost += costValue;
        }
        
        // Calculate trends if we have a previous period
        if (previous) {
          const latestCost = parseFloat(String(latest[periodColumns.periodCostIdx]).replace(/[^0-9.-]/g, '')) || 0;
          const prevCost = parseFloat(String(previous[periodColumns.periodCostIdx]).replace(/[^0-9.-]/g, '')) || 0;
          
          if (prevCost > 0) {
            periodTrends.costTrend += ((latestCost - prevCost) / prevCost) * 100;
          }
          
          const latestTime = parseFloat(String(latest[periodColumns.periodTimeIdx]).replace(/[^0-9.-]/g, '')) || 0;
          const prevTime = parseFloat(String(previous[periodColumns.periodTimeIdx]).replace(/[^0-9.-]/g, '')) || 0;
          
          if (prevTime > 0) {
            periodTrends.timeTrend += ((latestTime - prevTime) / prevTime) * 100;
          }
        }
        
        // Get forecast values from any row (they should be the same)
        if (timeSavingsIdx >= 0) {
          const forecastTime = parseFloat(String(latest[timeSavingsIdx]).replace(/[^0-9.-]/g, '')) || 0;
          totalTimeSavings += forecastTime;
        }
        
        if (costSavingsIdx >= 0) {
          const forecastCost = parseFloat(String(latest[costSavingsIdx]).replace(/[^0-9.-]/g, '')) || 0;
          totalCostSavings += forecastCost;
        }
      });
      
      // Average the trends
      periodTrends.costTrend = automationCount > 0 ? periodTrends.costTrend / automationCount : 0;
      periodTrends.timeTrend = automationCount > 0 ? periodTrends.timeTrend / automationCount : 0;
      
    } else {
      // Standard forecast view - sum all rows
      automationCount = filteredData.length;
      
      filteredData.forEach((row) => {
        if (timeSavingsIdx >= 0 && row[timeSavingsIdx] != null) {
          const timeValue = typeof row[timeSavingsIdx] === 'number' 
            ? row[timeSavingsIdx] 
            : parseFloat(String(row[timeSavingsIdx]).replace(/[^0-9.-]/g, ''));
          
          if (!isNaN(timeValue)) {
            totalTimeSavings += timeValue;
          }
        }
        
        if (costSavingsIdx >= 0 && row[costSavingsIdx] != null) {
          const costValue = typeof row[costSavingsIdx] === 'number'
            ? row[costSavingsIdx]
            : parseFloat(String(row[costSavingsIdx]).replace(/[^0-9.-]/g, ''));
          
          if (!isNaN(costValue)) {
            totalCostSavings += costValue;
          }
        }
      });
    }

    const avgTimeSavings = automationCount > 0 ? totalTimeSavings / automationCount : 0;
    const avgCostSavings = automationCount > 0 ? totalCostSavings / automationCount : 0;
    const avgPeriodTime = automationCount > 0 ? totalPeriodTime / automationCount : 0;
    const avgPeriodCost = automationCount > 0 ? totalPeriodCost / automationCount : 0;

    return {
      totalTimeSavings,
      totalCostSavings,
      totalPeriodTime,
      totalPeriodCost,
      automationCount,
      avgTimeSavings,
      avgCostSavings,
      avgPeriodTime,
      avgPeriodCost,
      timeSavingsIdx,
      costSavingsIdx,
      periodTrends
    };
  }, [filteredData, headers, viewMode, periodColumns]);

  // Detect team/area column for grouping
  const teamColumnIdx = useMemo(() => {
    return headers.findIndex(h => {
      const lower = h?.toLowerCase() || '';
      return lower.includes('area') || lower.includes('team') || 
             lower.includes('department') || lower.includes('group');
    });
  }, [headers]);

  const allChartData = useMemo(() => {
    if (!metrics) return [];
    
    const parseNum = (v: any) => {
      if (v == null) return 0;
      return typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0;
    };
    
    // For period tracking views, group by use case and get latest period
    if (viewMode !== "forecast" && periodColumns.hasPeriodData) {
      const useCaseMap = new Map<string, any[]>();
      
      filteredData.forEach((row) => {
        const useCaseName = row[0]?.toString() || '';
        if (!useCaseMap.has(useCaseName)) {
          useCaseMap.set(useCaseName, []);
        }
        useCaseMap.get(useCaseName)!.push(row);
      });
      
      const result: any[] = [];
      
      useCaseMap.forEach((rows, useCaseName) => {
        const sorted = rows.sort((a, b) => {
          const periodA = a[periodColumns.reportingPeriodIdx]?.toString() || '';
          const periodB = b[periodColumns.reportingPeriodIdx]?.toString() || '';
          return periodB.localeCompare(periodA);
        });
        
        const latest = sorted[0];
        const periodTime = periodColumns.periodTimeIdx >= 0 ? parseNum(latest[periodColumns.periodTimeIdx]) : 0;
        const periodCost = periodColumns.periodCostIdx >= 0 ? parseNum(latest[periodColumns.periodCostIdx]) : 0;
        const forecastTime = metrics.timeSavingsIdx >= 0 ? parseNum(latest[metrics.timeSavingsIdx]) : 0;
        const forecastCost = metrics.costSavingsIdx >= 0 ? parseNum(latest[metrics.costSavingsIdx]) : 0;
        
        result.push({
          index: result.length,
          name: useCaseName,
          shortName: useCaseName.substring(0, 25),
          "Time Savings (hrs)": viewMode === "forecast-vs-actual" ? forecastTime : periodTime,
          "Cost Savings ($)": viewMode === "forecast-vs-actual" ? forecastCost : periodCost,
          "Actual Time (hrs)": periodTime,
          "Actual Cost ($)": periodCost,
          "Forecast Time (hrs)": forecastTime,
          "Forecast Cost ($)": forecastCost,
          timeSavings: viewMode === "forecast-vs-actual" ? forecastTime : periodTime,
          costSavings: viewMode === "forecast-vs-actual" ? forecastCost : periodCost,
          actualTime: periodTime,
          actualCost: periodCost,
          forecastTime,
          forecastCost
        });
      });
      
      return result;
    }
    
    // Forecast view - use forecast columns
    return filteredData.map((row, idx) => {
      const timeSavings = metrics.timeSavingsIdx >= 0 ? parseNum(row[metrics.timeSavingsIdx]) : 0;
      const costSavings = metrics.costSavingsIdx >= 0 ? parseNum(row[metrics.costSavingsIdx]) : 0;
      
      return {
        index: idx,
        name: row[0]?.toString() || `Item ${idx + 1}`,
        shortName: row[0]?.toString().substring(0, 25) || `Item ${idx + 1}`,
        "Time Savings (hrs)": timeSavings,
        "Cost Savings ($)": costSavings,
        timeSavings,
        costSavings
      };
    });
  }, [filteredData, metrics, viewMode, periodColumns]);

  const chartData = useMemo(() => {
    if (selectedUseCases.length === 0) {
      return allChartData.slice(0, 15);
    }
    return allChartData.filter(item => selectedUseCases.includes(item.index));
  }, [allChartData, selectedUseCases]);

  const toggleUseCase = (index: number) => {
    setSelectedUseCases(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const selectAll = () => {
    setSelectedUseCases(allChartData.map(item => item.index));
  };

  const clearAll = () => {
    setSelectedUseCases([]);
  };

  const pieData = useMemo(() => {
    if (!metrics || !chartData.length) return [];
    
    // If we have a team/area column, group by that
    if (teamColumnIdx >= 0) {
      const teamSavings = new Map<string, number>();
      
      chartData.forEach((item) => {
        const originalRow = filteredData[item.index];
        const teamName = originalRow[teamColumnIdx]?.toString() || 'Unknown';
        const currentSavings = teamSavings.get(teamName) || 0;
        teamSavings.set(teamName, currentSavings + item.costSavings);
      });
      
      // Convert map to array and sort by savings
      return Array.from(teamSavings.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }
    
    // Fallback to individual use cases if no team column
    const sorted = [...chartData].sort((a, b) => b.costSavings - a.costSavings);
    const totalSavings = sorted.reduce((sum, item) => sum + item.costSavings, 0);
    const significantItems = sorted.filter(item => (item.costSavings / totalSavings) >= 0.02).slice(0, 8);
    const itemsToShow = significantItems.length >= 3 ? significantItems : sorted.slice(0, 6);
    
    return itemsToShow.map((item) => ({
      name: item.name,
      value: item.costSavings
    }));
  }, [chartData, metrics, teamColumnIdx, filteredData]);

  if (!data.length || !headers.length || !metrics) return null;

  // Determine what values to display based on view mode
  const displayValues = useMemo(() => {
    if (viewMode === "forecast") {
      return {
        costValue: metrics.totalCostSavings,
        timeValue: metrics.totalTimeSavings,
        costSubtitle: "Forecasted annual savings",
        timeSubtitle: "Forecasted productivity gain",
        avgCostValue: metrics.avgCostSavings,
        avgTimeValue: metrics.avgTimeSavings,
        costTrend: undefined,
        timeTrend: undefined
      };
    } else if (viewMode === "period-tracking") {
      return {
        costValue: metrics.totalPeriodCost,
        timeValue: metrics.totalPeriodTime,
        costSubtitle: "Actual period savings",
        timeSubtitle: "Actual period productivity",
        avgCostValue: metrics.avgPeriodCost,
        avgTimeValue: metrics.avgPeriodTime,
        costTrend: metrics.periodTrends.costTrend,
        timeTrend: metrics.periodTrends.timeTrend
      };
    } else {
      // forecast-vs-actual
      const costVariance = metrics.totalCostSavings > 0 
        ? ((metrics.totalPeriodCost - metrics.totalCostSavings) / metrics.totalCostSavings) * 100 
        : 0;
      const timeVariance = metrics.totalTimeSavings > 0 
        ? ((metrics.totalPeriodTime - metrics.totalTimeSavings) / metrics.totalTimeSavings) * 100 
        : 0;
      
      return {
        costValue: metrics.totalPeriodCost,
        timeValue: metrics.totalPeriodTime,
        costSubtitle: `${costVariance >= 0 ? '+' : ''}${costVariance.toFixed(1)}% vs Forecast`,
        timeSubtitle: `${timeVariance >= 0 ? '+' : ''}${timeVariance.toFixed(1)}% vs Forecast`,
        avgCostValue: metrics.avgPeriodCost,
        avgTimeValue: metrics.avgPeriodTime,
        costTrend: costVariance,
        timeTrend: timeVariance
      };
    }
  }, [viewMode, metrics]);

  return (
    <div className="w-full space-y-8">
      {/* Period Tracking Alert */}
      {viewMode !== "forecast" && periodColumns.hasPeriodData && (
        <Alert className="bg-blue-500/10 border-blue-500/50">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm">
            {viewMode === "period-tracking" 
              ? "Showing actual reporting period data with period-over-period trends"
              : "Comparing forecasted values against actual reporting period performance"}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Hero Header */}
      <div className="text-center mb-8 p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border border-primary/30 shadow-lg">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
          {viewMode === "forecast" && "Automation Impact Summary"}
          {viewMode === "period-tracking" && "Period Performance Tracking"}
          {viewMode === "forecast-vs-actual" && "Forecast vs Actual Analysis"}
        </h2>
        <p className="text-xl text-muted-foreground">
          Analyzing {metrics.automationCount} Automation Use Cases
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={viewMode === "forecast" ? "Total Cost Savings" : "Actual Cost Savings"}
          value={formatCurrency(displayValues.costValue)}
          subtitle={displayValues.costSubtitle}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          trend={displayValues.costTrend}
        />
        <KPICard
          title={viewMode === "forecast" ? "Total Time Savings" : "Actual Time Savings"}
          value={formatHours(displayValues.timeValue)}
          subtitle={displayValues.timeSubtitle}
          icon={<Clock className="w-6 h-6 text-white" />}
          trend={displayValues.timeTrend}
        />
        <KPICard
          title="Active Automations"
          value={metrics.automationCount}
          subtitle="Use cases deployed"
          icon={<Zap className="w-6 h-6 text-white" />}
        />
        <KPICard
          title="Avg. ROI per Automation"
          value={formatCurrency(displayValues.avgCostValue)}
          subtitle={`${formatHours(displayValues.avgTimeValue)} saved`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
        />
      </div>

      {/* Use Case Filter */}
      <div className="flex items-center gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[300px] justify-start">
              {selectedUseCases.length === 0 
                ? `Select use cases to display (showing ${Math.min(chartData.length, allChartData.length)})` 
                : `${selectedUseCases.length} use case${selectedUseCases.length > 1 ? 's' : ''} selected`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0 bg-popover border-border" align="start">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <span className="font-semibold text-sm">Select Use Cases</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs">
                  Clear
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-3">
                {allChartData.map((item) => (
                  <div key={item.index} className="flex items-start space-x-3 hover:bg-accent/10 p-2 rounded">
                    <Checkbox
                      id={`use-case-${item.index}`}
                      checked={selectedUseCases.includes(item.index)}
                      onCheckedChange={() => toggleUseCase(item.index)}
                    />
                    <label
                      htmlFor={`use-case-${item.index}`}
                      className="text-sm flex-1 cursor-pointer leading-tight"
                    >
                      {item.name}
                      <span className="text-muted-foreground text-xs block mt-0.5">
                        {formatCurrency(item.costSavings)} • {item.timeSavings.toFixed(0)}h
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {viewMode === "forecast-vs-actual" ? (
          <ChartCard title="Actual vs Forecast Cost Savings" id="cost-comparison-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ bottom: 60, left: 10, right: 10, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="shortName" 
                  stroke="hsl(var(--foreground))" 
                  tick={{ fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  height={90}
                  interval={0}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                    return `$${value.toFixed(0)}`;
                  }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="Forecast Cost ($)" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Actual Cost ($)" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        ) : (
          <ChartCard title="Cost Savings by Use Case" id="cost-bar-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ bottom: 60, left: 10, right: 10, top: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="shortName" 
                stroke="hsl(var(--foreground))" 
                tick={{ fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                height={90}
                interval={0}
              />
              <YAxis 
                scale="sqrt"
                domain={['auto', 'auto']}
                stroke="hsl(var(--foreground))"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                  return `$${value.toFixed(0)}`;
                }}
                allowDataOverflow={false}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar 
                dataKey="Cost Savings ($)" 
                fill={CHART_COLORS.blue}
                radius={[8, 8, 0, 0]}
                minPointSize={6}
                label={{ 
                  position: 'top', 
                  fontSize: 10,
                  fill: 'hsl(var(--foreground))',
                  formatter: (value: number) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                    return `$${value.toFixed(0)}`;
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        )}

        {viewMode === "forecast-vs-actual" ? (
          <ChartCard title="Actual vs Forecast Time Savings" id="time-comparison-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ bottom: 60, left: 10, right: 10, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="shortName" 
                  stroke="hsl(var(--foreground))" 
                  tick={{ fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  height={90}
                  interval={0}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}Kh`;
                    return `${value}h`;
                  }}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(0)} hours`}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="Forecast Time (hrs)" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Actual Time (hrs)" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        ) : (
          <ChartCard title="Time Savings by Use Case" id="time-bar-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ bottom: 60, left: 10, right: 10, top: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="shortName" 
                stroke="hsl(var(--foreground))" 
                tick={{ fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                height={90}
                interval={0}
              />
              <YAxis 
                scale="log"
                domain={[1, 'auto']}
                stroke="hsl(var(--foreground))"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}Kh`;
                  return `${value}h`;
                }}
                allowDataOverflow={false}
              />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(0)} hours`}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar 
                dataKey="Time Savings (hrs)" 
                fill={CHART_COLORS.green}
                radius={[8, 8, 0, 0]}
                label={{ 
                  position: 'top', 
                  fontSize: 10,
                  fill: 'hsl(var(--foreground))',
                  formatter: (value: number) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}Kh`;
                    return `${value.toFixed(0)}h`;
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        )}

        <ChartCard
          title="ROI Analysis by Use Case" 
          description="Cost savings per hour saved (higher = more cost-effective)"
          id="roi-chart"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData.map(item => ({
                ...item,
                "ROI ($/h)": item.timeSavings > 0 ? item.costSavings / item.timeSavings : 0
              }))} 
              margin={{ bottom: 60, left: 10, right: 10, top: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="shortName" 
                stroke="hsl(var(--foreground))" 
                tick={{ fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                height={90}
                interval={0}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `$${value.toFixed(0)}/h`}
              />
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)} per hour`}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar 
                dataKey="ROI ($/h)" 
                fill={CHART_COLORS.purple}
                radius={[8, 8, 0, 0]}
                minPointSize={6}
                label={{ 
                  position: 'top', 
                  fontSize: 10,
                  fill: 'hsl(var(--foreground))',
                  formatter: (value: number) => `$${value.toFixed(0)}/h`
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={teamColumnIdx >= 0 ? `Cost Savings by ${headers[teamColumnIdx]}` : "Cost Savings Distribution"}
          id="cost-pie-chart"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={85}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => value.length > 30 ? value.substring(0, 30) + '...' : value}
                wrapperStyle={{ 
                  paddingTop: "10px",
                  fontSize: "11px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-6 border border-primary/30 shadow-lg">
        <h3 className="text-2xl font-bold text-card-foreground mb-4">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Annual Savings</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(metrics.totalCostSavings)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Productivity Hours Reclaimed</p>
            <p className="text-3xl font-bold text-secondary">{formatHours(metrics.totalTimeSavings)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Average ROI per Use Case</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {formatCurrency(metrics.avgCostSavings)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
