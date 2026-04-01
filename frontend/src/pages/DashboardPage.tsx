import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeatureList } from "@/components/features/FeatureList";
import { useFeatures } from "@/hooks/useFeatures";

export function DashboardPage() {
  const navigate = useNavigate();
  const { features, loading } = useFeatures();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Features</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Track and measure the impact of your feature deployments.
          </p>
        </div>
        <Button onClick={() => navigate("/features/new")}>
          <Plus className="h-4 w-4" />
          New Feature
        </Button>
      </div>

      <FeatureList features={features} loading={loading} />
    </div>
  );
}
