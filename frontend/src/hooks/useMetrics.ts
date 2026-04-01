import { useState, useEffect, useCallback } from "react";
import {
  api,
  MetricDefinition,
  MetricSnapshot,
  MetricCreateInput,
} from "@/lib/api";

export function useMetrics(featureId: string) {
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMetricDefinitions(featureId);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }, [featureId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const addMetric = useCallback(
    async (data: MetricCreateInput) => {
      const metric = await api.createMetricDefinition(featureId, data);
      setMetrics((prev) => [...prev, metric]);
      return metric;
    },
    [featureId]
  );

  return { metrics, loading, error, fetchMetrics, addMetric };
}

export function useMetricSnapshots(metricId: string | null) {
  const [snapshots, setSnapshots] = useState<MetricSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    if (!metricId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMetricSnapshots(metricId);
      setSnapshots(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch snapshots"
      );
    } finally {
      setLoading(false);
    }
  }, [metricId]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  return { snapshots, loading, error, refetch: fetchSnapshots };
}
