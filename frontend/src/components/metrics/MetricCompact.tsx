import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

interface MetricCompactProps {
  name: string;
  value: number;
  change?: number;
  unit?: string;
  className?: string;
}

export function MetricCompact({
  name,
  value,
  change,
  unit,
  className,
}: MetricCompactProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <span className="text-sm text-text-secondary">{name}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-text">
          {formatNumber(value)}
          {unit && <span className="text-text-tertiary ml-0.5 font-normal">{unit}</span>}
        </span>
        {change !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isPositive && "text-success",
              isNegative && "text-danger",
              isNeutral && "text-text-tertiary"
            )}
          >
            {isPositive && <TrendingUp className="h-3 w-3" />}
            {isNegative && <TrendingDown className="h-3 w-3" />}
            {isNeutral && <Minus className="h-3 w-3" />}
            {change !== undefined ? `${Math.abs(change).toFixed(1)}%` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
