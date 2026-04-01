import { useState, useEffect, useCallback } from "react";
import { ImageOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, Screenshot } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

interface BeforeAfterViewProps {
  featureId: string;
}

export function BeforeAfterView({ featureId }: BeforeAfterViewProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"side-by-side" | "toggle">("side-by-side");
  const [activeToggle, setActiveToggle] = useState<"before" | "after">("before");

  const fetchScreenshots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getScreenshots(featureId);
      setScreenshots(data);
    } catch (err) {
      console.error("Failed to fetch screenshots:", err);
    } finally {
      setLoading(false);
    }
  }, [featureId]);

  useEffect(() => {
    fetchScreenshots();
  }, [fetchScreenshots]);

  const beforeShots = screenshots.filter((s) => s.type === "before");
  const afterShots = screenshots.filter((s) => s.type === "after");

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 animate-pulse rounded-xl border border-border bg-white" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-white" />
      </div>
    );
  }

  if (screenshots.length === 0) {
    return (
      <EmptyState
        icon={ImageOff}
        title="No screenshots yet"
        description="Upload before and after screenshots to visually compare changes."
      />
    );
  }

  return (
    <Card
      title="Before / After Comparison"
      actions={
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setViewMode("side-by-side")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors",
              viewMode === "side-by-side"
                ? "bg-primary text-white"
                : "bg-white text-text-secondary hover:bg-canvas"
            )}
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode("toggle")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
              viewMode === "toggle"
                ? "bg-primary text-white"
                : "bg-white text-text-secondary hover:bg-canvas"
            )}
          >
            Toggle
          </button>
        </div>
      }
    >
      {viewMode === "side-by-side" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
              Before
            </p>
            {beforeShots.length > 0 ? (
              <div className="space-y-3">
                {beforeShots.map((s) => (
                  <div key={s.id} className="relative">
                    <img
                      src={s.url}
                      alt={s.caption || "Before screenshot"}
                      className="w-full rounded-lg border border-border object-cover"
                    />
                    {s.caption && (
                      <p className="mt-1 text-xs text-text-secondary">{s.caption}</p>
                    )}
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {formatDate(s.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-text-tertiary">
                No before screenshots
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
              After
            </p>
            {afterShots.length > 0 ? (
              <div className="space-y-3">
                {afterShots.map((s) => (
                  <div key={s.id} className="relative">
                    <img
                      src={s.url}
                      alt={s.caption || "After screenshot"}
                      className="w-full rounded-lg border border-border object-cover"
                    />
                    {s.caption && (
                      <p className="mt-1 text-xs text-text-secondary">{s.caption}</p>
                    )}
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {formatDate(s.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-text-tertiary">
                No after screenshots
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex rounded-lg border border-border overflow-hidden mb-4 w-fit">
            <button
              onClick={() => setActiveToggle("before")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeToggle === "before"
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary hover:bg-canvas"
              )}
            >
              Before
            </button>
            <button
              onClick={() => setActiveToggle("after")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-l border-border",
                activeToggle === "after"
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary hover:bg-canvas"
              )}
            >
              After
            </button>
          </div>
          <div className="space-y-3">
            {(activeToggle === "before" ? beforeShots : afterShots).length > 0 ? (
              (activeToggle === "before" ? beforeShots : afterShots).map((s) => (
                <div key={s.id}>
                  <img
                    src={s.url}
                    alt={s.caption || `${activeToggle} screenshot`}
                    className="w-full rounded-lg border border-border object-cover"
                  />
                  {s.caption && (
                    <p className="mt-1 text-xs text-text-secondary">{s.caption}</p>
                  )}
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {formatDate(s.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-text-tertiary">
                No {activeToggle} screenshots
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
