import { Badge } from "@/components/ui/Badge";

type Confidence = "high" | "medium" | "low";

const confidenceConfig: Record<
  Confidence,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  high: { label: "High Confidence", variant: "success" },
  medium: { label: "Medium Confidence", variant: "warning" },
  low: { label: "Low Confidence", variant: "danger" },
};

interface ConfidenceBadgeProps {
  confidence: Confidence;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const config = confidenceConfig[confidence];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
