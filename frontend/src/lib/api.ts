const API_BASE = "/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  deploy_date: string;
  hypothesis: string;
  expected_direction: "increase" | "decrease";
  expected_change_pct: number;
  owner: string;
  tags: string[];
  status: "planned" | "monitoring" | "concluded" | "inconclusive";
  created_at: string;
  updated_at: string;
}

export interface FeatureCreateInput {
  name: string;
  description: string;
  deploy_date: string;
  hypothesis: string;
  expected_direction: "increase" | "decrease";
  expected_change_pct: number;
  owner: string;
  tags: string[];
  status: "planned" | "monitoring" | "concluded" | "inconclusive";
}

export interface MetricDefinition {
  id: string;
  feature_id: string;
  name: string;
  analysis_type: string;
  bloomreach_analysis_id: string;
  value_extraction_path: Record<string, string>;
  unit: string;
  expected_direction: "increase" | "decrease";
  is_primary: boolean;
  created_at: string;
}

export interface MetricSnapshot {
  id: string;
  metric_id: string;
  timestamp: string;
  value: number;
  period_type: "pre" | "post";
}

export interface MetricCreateInput {
  name: string;
  analysis_type: string;
  bloomreach_analysis_id: string;
  value_extraction_path: Record<string, string>;
  unit: string;
  expected_direction: "increase" | "decrease";
  is_primary: boolean;
}

export interface Analysis {
  id: string;
  feature_id: string;
  summary: string;
  key_findings: string[];
  concerns: string[];
  recommendation: string;
  confidence: "high" | "medium" | "low";
  created_at: string;
}

export interface Screenshot {
  id: string;
  feature_id: string;
  type: "before" | "after";
  url: string;
  caption: string;
  created_at: string;
}

export interface BloomreachTestResult {
  success: boolean;
  message: string;
}

export const api = {
  // Features
  getFeatures: () => request<Feature[]>("/features"),
  getFeature: (id: string) => request<Feature>(`/features/${id}`),
  createFeature: (data: FeatureCreateInput) =>
    request<Feature>("/features", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateFeature: (id: string, data: Partial<FeatureCreateInput>) =>
    request<Feature>(`/features/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteFeature: (id: string) =>
    request<void>(`/features/${id}`, { method: "DELETE" }),

  // Metrics
  getMetricDefinitions: (featureId: string) =>
    request<MetricDefinition[]>(`/features/${featureId}/metrics`),
  createMetricDefinition: (featureId: string, data: MetricCreateInput) =>
    request<MetricDefinition>(`/features/${featureId}/metrics`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMetricSnapshots: (metricId: string) =>
    request<MetricSnapshot[]>(`/metrics/${metricId}/snapshots`),

  // Analysis
  getAnalysis: (featureId: string) =>
    request<Analysis>(`/features/${featureId}/analysis`),
  triggerAnalysis: (featureId: string) =>
    request<Analysis>(`/features/${featureId}/analysis`, { method: "POST" }),

  // Screenshots
  getScreenshots: (featureId: string) =>
    request<Screenshot[]>(`/features/${featureId}/screenshots`),
  uploadScreenshot: (featureId: string, formData: FormData) =>
    fetch(`${API_BASE}/features/${featureId}/screenshots`, {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error("Upload failed");
      return res.json() as Promise<Screenshot>;
    }),

  // Bloomreach
  testBloomreachConnection: (config: {
    api_url: string;
    api_key: string;
    api_secret: string;
    project_token: string;
  }) =>
    request<BloomreachTestResult>("/bloomreach/test", {
      method: "POST",
      body: JSON.stringify(config),
    }),
};
