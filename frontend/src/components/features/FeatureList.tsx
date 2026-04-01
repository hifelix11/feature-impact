import { useState, useMemo } from "react";
import { Search, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeatureCard } from "./FeatureCard";
import type { Feature } from "@/lib/api";

interface FeatureListProps {
  features: Feature[];
  loading: boolean;
}

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Monitoring", value: "monitoring" },
  { label: "Planned", value: "planned" },
  { label: "Concluded", value: "concluded" },
  { label: "Inconclusive", value: "inconclusive" },
];

export function FeatureList({ features, loading }: FeatureListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return features.filter((f) => {
      const matchesSearch =
        !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [features, search, statusFilter]);

  const tabsWithCounts = statusTabs.map((tab) => ({
    ...tab,
    count:
      tab.value === "all"
        ? features.length
        : features.filter((f) => f.status === tab.value).length,
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-xl border border-border bg-white"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={tabsWithCounts}
          activeTab={statusFilter}
          onChange={setStatusFilter}
        />
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No features found"
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Create your first feature to start tracking impact."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      )}
    </div>
  );
}
