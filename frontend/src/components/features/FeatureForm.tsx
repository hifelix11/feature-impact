import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import type { FeatureCreateInput } from "@/lib/api";

const featureSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required"),
  deploy_date: z.string().min(1, "Deploy date is required"),
  hypothesis: z.string().min(1, "Hypothesis is required"),
  expected_direction: z.enum(["increase", "decrease"]),
  expected_change_pct: z.coerce
    .number()
    .min(0, "Must be 0 or greater")
    .max(1000),
  owner: z.string().min(1, "Owner is required"),
  tags: z.string().transform((val) =>
    val
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  ),
  status: z.enum(["planned", "monitoring", "concluded", "inconclusive"]),
});

type FormValues = z.input<typeof featureSchema>;

interface FeatureFormProps {
  defaultValues?: Partial<FeatureCreateInput>;
  onSubmit: (data: FeatureCreateInput) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export function FeatureForm({
  defaultValues,
  onSubmit,
  submitLabel = "Create Feature",
  loading = false,
}: FeatureFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      deploy_date: defaultValues?.deploy_date ?? "",
      hypothesis: defaultValues?.hypothesis ?? "",
      expected_direction: defaultValues?.expected_direction ?? "increase",
      expected_change_pct: defaultValues?.expected_change_pct ?? 0,
      owner: defaultValues?.owner ?? "",
      tags: defaultValues?.tags?.join(", ") ?? "",
      status: defaultValues?.status ?? "planned",
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data as unknown as FeatureCreateInput);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 max-w-2xl">
      <Card title="Basic Information">
        <div className="space-y-4">
          <Input
            label="Feature Name"
            placeholder="e.g., New Checkout Flow"
            error={errors.name?.message}
            {...register("name")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Description</label>
            <textarea
              placeholder="Describe what this feature does..."
              rows={3}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              {...register("description")}
            />
            {errors.description?.message && (
              <p className="text-xs text-danger">{errors.description.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Deploy Date"
              type="date"
              error={errors.deploy_date?.message}
              {...register("deploy_date")}
            />
            <Input
              label="Owner"
              placeholder="e.g., John Doe"
              error={errors.owner?.message}
              {...register("owner")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              options={[
                { label: "Planned", value: "planned" },
                { label: "Monitoring", value: "monitoring" },
                { label: "Concluded", value: "concluded" },
                { label: "Inconclusive", value: "inconclusive" },
              ]}
              error={errors.status?.message}
              {...register("status")}
            />
            <Input
              label="Tags (comma-separated)"
              placeholder="e.g., checkout, ux, experiment"
              error={errors.tags?.message}
              {...register("tags")}
            />
          </div>
        </div>
      </Card>

      <Card title="Hypothesis & Expectations">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Hypothesis</label>
            <textarea
              placeholder="We believe that... will result in..."
              rows={3}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              {...register("hypothesis")}
            />
            {errors.hypothesis?.message && (
              <p className="text-xs text-danger">{errors.hypothesis.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Expected Direction"
              options={[
                { label: "Increase", value: "increase" },
                { label: "Decrease", value: "decrease" },
              ]}
              error={errors.expected_direction?.message}
              {...register("expected_direction")}
            />
            <Input
              label="Expected Change (%)"
              type="number"
              step="0.1"
              placeholder="e.g., 5"
              error={errors.expected_change_pct?.message}
              {...register("expected_change_pct")}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
