import { BarChart3, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MetricDefinition } from "@/lib/api";

interface MetricCardProps {
  metric: MetricDefinition;
  selected?: boolean;
  onClick?: () => void;
}

export function MetricCard({ metric, selected, onClick }: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border bg-white p-4 transition-all hover:shadow-sm",
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/30"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-text-tertiary" />
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {metric.analysis_type}
          </span>
        </div>
        {metric.is_primary && (
          <Star className="h-4 w-4 text-warning fill-warning" />
        )}
      </div>

      <h4 className="text-sm font-semibold text-text mb-1">{metric.name}</h4>

      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <span>
          Expected: {metric.expected_direction}
        </span>
        {metric.unit && (
          <>
            <span className="text-border">|</span>
            <span>Unit: {metric.unit}</span>
          </>
        )}
      </div>

      <div className="mt-3 h-8 flex items-end gap-0.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-primary/20"
            style={{
              height: `${Math.max(15, Math.random() * 100)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
