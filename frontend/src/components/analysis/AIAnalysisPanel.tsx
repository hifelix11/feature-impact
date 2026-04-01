import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { formatDate } from "@/lib/utils";
import type { Analysis } from "@/lib/api";

interface AIAnalysisPanelProps {
  analysis: Analysis | null;
  loading: boolean;
  triggering: boolean;
  onTrigger: () => void;
}

export function AIAnalysisPanel({
  analysis,
  loading,
  triggering,
  onTrigger,
}: AIAnalysisPanelProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border bg-white"
          />
        ))}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div>
        <EmptyState
          icon={Brain}
          title="No analysis yet"
          description="Run an AI analysis to get insights about your feature's impact based on the collected metrics."
          actionLabel="Run Analysis"
          onAction={onTrigger}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ConfidenceBadge confidence={analysis.confidence} />
          <span className="text-xs text-text-tertiary">
            Generated {formatDate(analysis.created_at)}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onTrigger}
          loading={triggering}
        >
          <Brain className="h-4 w-4" />
          Re-run Analysis
        </Button>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text mb-1">Summary</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {analysis.summary}
            </p>
          </div>
        </div>
      </Card>

      {analysis.key_findings.length > 0 && (
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-light">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text mb-2">
                Key Findings
              </h3>
              <ul className="space-y-1.5">
                {analysis.key_findings.map((finding, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {analysis.concerns.length > 0 && (
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-light">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text mb-2">Concerns</h3>
              <ul className="space-y-1.5">
                {analysis.concerns.map((concern, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-light">
            <Lightbulb className="h-4 w-4 text-purple" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text mb-1">
              Recommendation
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {analysis.recommendation}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
