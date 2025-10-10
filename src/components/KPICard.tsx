import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
}

export const KPICard = ({ title, value, subtitle, icon, trend }: KPICardProps) => {
  const isPositiveTrend = trend === undefined || trend >= 0;
  const showTrend = trend !== undefined;
  
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-lg">
          {icon}
        </div>
        {showTrend && (
          <div className={`flex items-center gap-1 ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveTrend ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4 rotate-180" />
            )}
            <span className="text-sm font-semibold">
              {isPositiveTrend ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </Card>
  );
};
