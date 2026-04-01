import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FeatureForm } from "@/components/features/FeatureForm";
import { useFeatures } from "@/hooks/useFeatures";
import type { FeatureCreateInput } from "@/lib/api";

export function FeatureFormPage() {
  const navigate = useNavigate();
  const { createFeature } = useFeatures();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: FeatureCreateInput) => {
    setLoading(true);
    try {
      const feature = await createFeature(data);
      navigate(`/features/${feature.id}`);
    } catch (err) {
      console.error("Failed to create feature:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Features
        </button>
        <h1 className="text-xl font-bold text-text">New Feature</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Define a new feature to track its impact on your key metrics.
        </p>
      </div>

      <FeatureForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
