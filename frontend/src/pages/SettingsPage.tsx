import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plug, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const bloomreachSchema = z.object({
  api_url: z.string().url("Must be a valid URL"),
  api_key: z.string().min(1, "API key is required"),
  api_secret: z.string().min(1, "API secret is required"),
  project_token: z.string().min(1, "Project token is required"),
});

type BloomreachForm = z.infer<typeof bloomreachSchema>;

export function SettingsPage() {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<BloomreachForm>({
    resolver: zodResolver(bloomreachSchema),
    defaultValues: {
      api_url: "",
      api_key: "",
      api_secret: "",
      project_token: "",
    },
  });

  const handleTestConnection = async () => {
    const values = getValues();
    const result = bloomreachSchema.safeParse(values);
    if (!result.success) return;

    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testBloomreachConnection(result.data);
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Connection failed",
      });
    } finally {
      setTesting(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    localStorage.setItem("bloomreach_config", JSON.stringify(data));
    setTestResult({ success: true, message: "Configuration saved successfully." });
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Configure integrations and sync settings.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card
          title="Bloomreach Connection"
          actions={
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <Plug className="h-3.5 w-3.5" />
              Integration
            </div>
          }
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="API URL"
              placeholder="https://api.bloomreach.com"
              error={errors.api_url?.message}
              {...register("api_url")}
            />
            <Input
              label="API Key"
              placeholder="Your Bloomreach API key"
              error={errors.api_key?.message}
              {...register("api_key")}
            />
            <Input
              label="API Secret"
              type="password"
              placeholder="Your Bloomreach API secret"
              error={errors.api_secret?.message}
              {...register("api_secret")}
            />
            <Input
              label="Project Token"
              placeholder="Your Bloomreach project token"
              error={errors.project_token?.message}
              {...register("project_token")}
            />

            {testResult && (
              <div
                className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                  testResult.success
                    ? "bg-success-light text-success"
                    : "bg-danger-light text-danger"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" />
                )}
                {testResult.message}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleTestConnection}
                loading={testing}
              >
                Test Connection
              </Button>
              <Button type="submit">Save Configuration</Button>
            </div>
          </form>
        </Card>

        <Card title="Sync Configuration">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-text">Auto-sync metrics</p>
                <p className="text-xs text-text-secondary">
                  Automatically pull metric snapshots from Bloomreach every hour.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="h-6 w-11 rounded-full bg-border peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-text">
                  Auto-run analysis
                </p>
                <p className="text-xs text-text-secondary">
                  Trigger AI analysis automatically when enough data is collected.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-border peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
