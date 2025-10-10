import { useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ChartCard } from "./ChartCard";
import { KPICard } from "./KPICard";
import { DollarSign, Clock, TrendingUp, Zap } from "lucide-react";

interface ExecutiveDashboardProps {
  data: any[];
  headers: string[];
  filters: any;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];

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

  const chartData = useMemo(() => {
    if (!metrics) return [];
    
    return filteredData.slice(0, 15).map((row, idx) => {
      const timeSavings = metrics.timeSavingsIdx >= 0 ? parseFloat(row[metrics.timeSavingsIdx]) || 0 : 0;
      const costSavings = metrics.costSavingsIdx >= 0 ? parseFloat(row[metrics.costSavingsIdx]) || 0 : 0;
      
      return {
        name: row[0]?.toString().substring(0, 20) || `Item ${idx + 1}`,
        "Time Savings (hrs)": timeSavings,
        "Cost Savings ($)": costSavings,
        timeSavings,
        costSavings
      };
    });
  }, [filteredData, metrics]);

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
      <div className="text-center mb-8 p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl border border-primary/20">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-3">
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Cost Savings by Use Case" id="cost-bar-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--foreground))" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--foreground))" 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Legend />
              <Bar 
                dataKey="Cost Savings ($)" 
                fill={COLORS[0]}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Time Savings by Use Case" id="time-bar-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--foreground))" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--foreground))" 
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(0)} hours`}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Legend />
              <Bar 
                dataKey="Time Savings (hrs)" 
                fill={COLORS[1]}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Savings Trend Analysis" id="trend-line-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--foreground))" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(var(--foreground))" 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name.includes('Time')) return `${value.toFixed(0)} hours`;
                  return formatCurrency(value);
                }}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Cost Savings ($)" 
                stroke={COLORS[0]}
                strokeWidth={3}
                dot={{ fill: COLORS[0], r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="Time Savings (hrs)" 
                stroke={COLORS[1]}
                strokeWidth={3}
                dot={{ fill: COLORS[1], r: 5 }}
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
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
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
