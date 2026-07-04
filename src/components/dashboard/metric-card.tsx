import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  highlight?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight,
}: MetricCardProps) {
  return (
    <Card className={cn(highlight && "border-emerald-200 bg-emerald-50/30")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", highlight ? "text-emerald-600" : "text-slate-400")} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", highlight ? "text-emerald-700" : "text-slate-900")}>
          {typeof value === "number" && title.toLowerCase().includes("revenue")
            ? formatCurrency(value)
            : value}
        </div>
        {(subtitle || trend) && (
          <p className="mt-1 text-xs text-slate-500">{trend ?? subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
