import { useState, useEffect, useCallback } from "react";
import { api, Feature, FeatureCreateInput } from "@/lib/api";

export function useFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFeatures();
      setFeatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch features");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const createFeature = useCallback(async (data: FeatureCreateInput) => {
    const feature = await api.createFeature(data);
    setFeatures((prev) => [feature, ...prev]);
    return feature;
  }, []);

  const updateFeature = useCallback(
    async (id: string, data: Partial<FeatureCreateInput>) => {
      const updated = await api.updateFeature(id, data);
      setFeatures((prev) =>
        prev.map((f) => (f.id === id ? updated : f))
      );
      return updated;
    },
    []
  );

  const deleteFeature = useCallback(async (id: string) => {
    await api.deleteFeature(id);
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return {
    features,
    loading,
    error,
    fetchFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
  };
}

export function useFeature(id: string) {
  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeature = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFeature(id);
      setFeature(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch feature");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFeature();
  }, [fetchFeature]);

  return { feature, loading, error, refetch: fetchFeature };
}
