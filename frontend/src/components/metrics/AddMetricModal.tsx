import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { MetricCreateInput } from "@/lib/api";

const metricSchema = z.object({
  name: z.string().min(1, "Name is required"),
  analysis_type: z.string().min(1, "Analysis type is required"),
  bloomreach_analysis_id: z.string().min(1, "Bloomreach analysis ID is required"),
  value_extraction_path: z.string().min(1, "Extraction path is required"),
  unit: z.string(),
  expected_direction: z.enum(["increase", "decrease"]),
  is_primary: z.boolean(),
});

type FormValues = z.infer<typeof metricSchema>;

interface AddMetricModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MetricCreateInput) => Promise<void>;
}

export function AddMetricModal({ open, onClose, onSubmit }: AddMetricModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      name: "",
      analysis_type: "ab_test",
      bloomreach_analysis_id: "",
      value_extraction_path: '{"path": "results.metrics.primary"}',
      unit: "",
      expected_direction: "increase",
      is_primary: false,
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    let parsedPath: Record<string, string>;
    try {
      parsedPath = JSON.parse(data.value_extraction_path);
    } catch {
      parsedPath = { path: data.value_extraction_path };
    }

    await onSubmit({
      ...data,
      value_extraction_path: parsedPath,
    });
    reset();
  });

  return (
    <Modal open={open} onClose={onClose} title="Add Metric">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input
          label="Metric Name"
          placeholder="e.g., Conversion Rate"
          error={errors.name?.message}
          {...register("name")}
        />

        <Select
          label="Analysis Type"
          options={[
            { label: "A/B Test", value: "ab_test" },
            { label: "Funnel", value: "funnel" },
            { label: "Retention", value: "retention" },
            { label: "Revenue", value: "revenue" },
            { label: "Custom", value: "custom" },
          ]}
          error={errors.analysis_type?.message}
          {...register("analysis_type")}
        />

        <Input
          label="Bloomreach Analysis ID"
          placeholder="e.g., analysis_12345"
          error={errors.bloomreach_analysis_id?.message}
          {...register("bloomreach_analysis_id")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text">
            Value Extraction Path (JSON)
          </label>
          <textarea
            rows={2}
            placeholder='{"path": "results.metrics.primary"}'
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text font-mono placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            {...register("value_extraction_path")}
          />
          {errors.value_extraction_path?.message && (
            <p className="text-xs text-danger">
              {errors.value_extraction_path.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Unit"
            placeholder="e.g., %, USD, users"
            error={errors.unit?.message}
            {...register("unit")}
          />
          <Select
            label="Expected Direction"
            options={[
              { label: "Increase", value: "increase" },
              { label: "Decrease", value: "decrease" },
            ]}
            error={errors.expected_direction?.message}
            {...register("expected_direction")}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
            {...register("is_primary")}
          />
          <span className="text-sm text-text">Primary metric</span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Add Metric
          </Button>
        </div>
      </form>
    </Modal>
  );
}
