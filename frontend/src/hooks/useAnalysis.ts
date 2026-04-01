import { useState, useEffect, useCallback } from "react";
import { api, Analysis } from "@/lib/api";

export function useAnalysis(featureId: string) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAnalysis(featureId);
      setAnalysis(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch analysis";
      if (!msg.includes("404") && !msg.includes("Not Found")) {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [featureId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const triggerAnalysis = useCallback(async () => {
    setTriggering(true);
    setError(null);
    try {
      const data = await api.triggerAnalysis(featureId);
      setAnalysis(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to trigger analysis"
      );
    } finally {
      setTriggering(false);
    }
  }, [featureId]);

  return { analysis, loading, triggering, error, triggerAnalysis, refetch: fetchAnalysis };
}
