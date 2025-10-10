import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  id?: string;
  description?: string;
}

export const ChartCard = ({ title, children, id, description }: ChartCardProps) => {
  return (
    <Card id={id} className="p-6 bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold text-card-foreground mb-4">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
      )}
      <div className="w-full h-[300px]">
        {children}
      </div>
    </Card>
  );
};
