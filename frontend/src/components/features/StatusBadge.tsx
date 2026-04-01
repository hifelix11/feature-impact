import { Badge } from "@/components/ui/Badge";

type Status = "planned" | "monitoring" | "concluded" | "inconclusive";

const statusConfig: Record<Status, { label: string; variant: "primary" | "warning" | "success" | "danger" }> = {
  planned: { label: "Planned", variant: "primary" },
  monitoring: { label: "Monitoring", variant: "warning" },
  concluded: { label: "Concluded", variant: "success" },
  inconclusive: { label: "Inconclusive", variant: "danger" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
