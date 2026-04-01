import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "./StatusBadge";
import { MetricCard } from "@/components/metrics/MetricCard";
import { MetricChart } from "@/components/metrics/MetricChart";
import { AddMetricModal } from "@/components/metrics/AddMetricModal";
import { AIAnalysisPanel } from "@/components/analysis/AIAnalysisPanel";
import { ScreenshotUploader } from "@/components/screenshots/ScreenshotUploader";
import { BeforeAfterView } from "@/components/screenshots/BeforeAfterView";
import { useMetrics, useMetricSnapshots } from "@/hooks/useMetrics";
import { useAnalysis } from "@/hooks/useAnalysis";
import { formatDate } from "@/lib/utils";
import { Plus, Calendar, User, TrendingUp, TrendingDown } from "lucide-react";
import type { Feature } from "@/lib/api";

interface FeatureDetailProps {
  feature: Feature;
}

const detailTabs = [
  { label: "Overview", value: "overview" },
  { label: "Screenshots", value: "screenshots" },
  { label: "AI Analysis", value: "analysis" },
];

export function FeatureDetail({ feature }: FeatureDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [addMetricOpen, setAddMetricOpen] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const { metrics, loading: metricsLoading, addMetric } = useMetrics(feature.id);
  const { snapshots } = useMetricSnapshots(selectedMetricId);
  const {
    analysis,
    loading: analysisLoading,
    triggering,
    triggerAnalysis,
  } = useAnalysis(feature.id);

  const primaryMetric = metrics.find((m) => m.is_primary);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold text-text">{feature.name}</h1>
            <StatusBadge status={feature.status} />
          </div>
          <p className="text-sm text-text-secondary max-w-2xl">
            {feature.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Deployed {formatDate(feature.deploy_date)}
            </span>
            {feature.owner && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {feature.owner}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              {feature.expected_direction === "increase" ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-danger" />
              )}
              Expected {feature.expected_direction} of {feature.expected_change_pct}%
            </span>
          </div>
        </div>
      </div>

      {feature.hypothesis && (
        <Card className="mb-6">
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">
              Hypothesis
            </p>
            <p className="text-sm text-text-secondary">{feature.hypothesis}</p>
          </div>
        </Card>
      )}

      <Tabs tabs={detailTabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === "overview" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text">Metrics</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAddMetricOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Metric
            </Button>
          </div>

          {metricsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-white" />
              ))}
            </div>
          ) : metrics.length === 0 ? (
            <Card>
              <p className="text-center text-sm text-text-secondary py-4">
                No metrics added yet. Add a metric to start tracking impact.
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                {metrics.map((metric) => (
                  <MetricCard
                    key={metric.id}
                    metric={metric}
                    selected={selectedMetricId === metric.id}
                    onClick={() =>
                      setSelectedMetricId(
                        selectedMetricId === metric.id ? null : metric.id
                      )
                    }
                  />
                ))}
              </div>

              {selectedMetricId && (
                <Card title="Metric Trend" className="mb-6">
                  <MetricChart
                    snapshots={snapshots}
                    deployDate={feature.deploy_date}
                    metricName={
                      metrics.find((m) => m.id === selectedMetricId)?.name ?? ""
                    }
                    unit={
                      metrics.find((m) => m.id === selectedMetricId)?.unit ?? ""
                    }
                  />
                </Card>
              )}
            </>
          )}

          <AddMetricModal
            open={addMetricOpen}
            onClose={() => setAddMetricOpen(false)}
            onSubmit={async (data) => {
              await addMetric(data);
              setAddMetricOpen(false);
            }}
          />
        </div>
      )}

      {activeTab === "screenshots" && (
        <div className="space-y-6">
          <ScreenshotUploader featureId={feature.id} />
          <BeforeAfterView featureId={feature.id} />
        </div>
      )}

      {activeTab === "analysis" && (
        <AIAnalysisPanel
          analysis={analysis}
          loading={analysisLoading}
          triggering={triggering}
          onTrigger={triggerAnalysis}
        />
      )}
    </div>
  );
}
