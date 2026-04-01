import { useNavigate } from "react-router-dom";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils";
import type { Feature } from "@/lib/api";

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="group"
      onClick={() => navigate(`/features/${feature.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={feature.status} />
        {feature.expected_direction === "increase" ? (
          <TrendingUp className="h-4 w-4 text-success" />
        ) : (
          <TrendingDown className="h-4 w-4 text-danger" />
        )}
      </div>

      <h3 className="text-sm font-semibold text-text mb-1 group-hover:text-primary transition-colors">
        {feature.name}
      </h3>

      {feature.hypothesis && (
        <p className="text-xs text-text-secondary line-clamp-2 mb-3">
          {feature.hypothesis}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs text-text-tertiary mb-3">
        <Calendar className="h-3.5 w-3.5" />
        <span>{formatDate(feature.deploy_date)}</span>
        {feature.expected_change_pct > 0 && (
          <>
            <span className="text-border">|</span>
            <span className="text-primary font-medium">
              {feature.expected_direction === "increase" ? "+" : "-"}
              {feature.expected_change_pct}% expected
            </span>
          </>
        )}
      </div>

      {feature.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {feature.tags.map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
