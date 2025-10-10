import { useMemo, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ChartCard } from "./ChartCard";
import { KPICard } from "./KPICard";
import { DollarSign, Clock, TrendingUp, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";

interface ExecutiveDashboardProps {
  data: any[];
  headers: string[];
  filters: any;
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

export const ExecutiveDashboard = ({ data, headers, filters }: ExecutiveDashboardProps) => {
  const [selectedUseCases, setSelectedUseCases] = useState<number[]>([]);
  
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

    // More flexible column detection
    const timeSavingsIdx = headers.findIndex(h => {
      const lower = h?.toLowerCase() || '';
      return (lower.includes('time') && lower.includes('saving')) || 
             lower.includes('timesaving') ||
             lower === 'time savings';
    });
    
    const costSavingsIdx = headers.findIndex(h => {
      const lower = h?.toLowerCase() || '';
      return (lower.includes('cost') && lower.includes('saving')) || 
             lower.includes('costsaving') ||
             lower === 'cost savings';
    });

    let totalTimeSavings = 0;
    let totalCostSavings = 0;
    let automationCount = filteredData.length;

    // Sum all rows
    filteredData.forEach((row, index) => {
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

    const avgTimeSavings = automationCount > 0 ? totalTimeSavings / automationCount : 0;
    const avgCostSavings = automationCount > 0 ? totalCostSavings / automationCount : 0;

    return {
      totalTimeSavings,
      totalCostSavings,
      automationCount,
      avgTimeSavings,
      avgCostSavings,
      timeSavingsIdx,
      costSavingsIdx
    };
  }, [filteredData, headers]);

  const allChartData = useMemo(() => {
    if (!metrics) return [];
    
    return filteredData.map((row, idx) => {
      const timeSavings = metrics.timeSavingsIdx >= 0 ? parseFloat(row[metrics.timeSavingsIdx]) || 0 : 0;
      const costSavings = metrics.costSavingsIdx >= 0 ? parseFloat(row[metrics.costSavingsIdx]) || 0 : 0;
      
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
  }, [filteredData, metrics]);

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
    
    return chartData.slice(0, 8).map((item) => ({
      name: item.name,
      value: item.costSavings
    }));
  }, [chartData, metrics]);

  if (!data.length || !headers.length || !metrics) return null;

  return (
    <div className="w-full space-y-8">
      {/* Hero Header */}
      <div className="text-center mb-8 p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border border-primary/30 shadow-lg">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
          Automation Impact Summary
        </h2>
        <p className="text-xl text-muted-foreground">
          Analyzing {metrics.automationCount} Automation Use Cases
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Cost Savings"
          value={formatCurrency(metrics.totalCostSavings)}
          subtitle="Annual savings achieved"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          trend={100}
        />
        <KPICard
          title="Total Time Savings"
          value={formatHours(metrics.totalTimeSavings)}
          subtitle="Productivity gained per year"
          icon={<Clock className="w-6 h-6 text-white" />}
          trend={85}
        />
        <KPICard
          title="Active Automations"
          value={metrics.automationCount}
          subtitle="Use cases deployed"
          icon={<Zap className="w-6 h-6 text-white" />}
        />
        <KPICard
          title="Avg. ROI per Automation"
          value={formatCurrency(metrics.avgCostSavings)}
          subtitle={`${formatHours(metrics.avgTimeSavings)} saved`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
        />
      </div>

      {/* Use Case Filter */}
      <div className="flex items-center gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[300px] justify-start">
              {selectedUseCases.length === 0 
                ? "Select use cases to display (showing top 15)" 
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
        <ChartCard title="Cost Savings by Use Case" id="cost-bar-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ bottom: 60, left: 10, right: 10 }}>
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
                  return `$${value}`;
                }}
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
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Time Savings by Use Case" id="time-bar-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ bottom: 60, left: 10, right: 10 }}>
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
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Savings Trend Analysis" id="trend-line-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ bottom: 50, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="shortName" 
                stroke="hsl(var(--foreground))" 
                tick={{ fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                  return `$${value}`;
                }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name.includes('Time')) return `${value.toFixed(0)} hours`;
                  return formatCurrency(value);
                }}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line 
                type="monotone" 
                dataKey="Cost Savings ($)" 
                stroke={CHART_COLORS.blue}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.blue, r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="Time Savings (hrs)" 
                stroke={CHART_COLORS.green}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.green, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cost Savings Distribution" id="cost-pie-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.substring(0, 15)}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
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
