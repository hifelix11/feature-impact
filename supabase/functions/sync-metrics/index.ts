import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MetricDefinition {
  id: string;
  bloomreach_analysis_id: string;
  analysis_type: string;
  value_extraction_path: { path: string };
  feature_id: string;
}

interface Connection {
  api_url: string;
  project_token: string;
  api_key_id: string;
  api_secret_encrypted: string;
}

function extractValue(obj: Record<string, unknown>, path: string): number {
  const parts = path.split(/\.|\[|\]/).filter(Boolean);
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return 0;
    if (part.startsWith("-")) {
      // Handle negative index like steps[-1]
      const arr = current as unknown[];
      const idx = arr.length + parseInt(part);
      current = arr[idx];
    } else if (!isNaN(Number(part))) {
      current = (current as unknown[])[parseInt(part)];
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }
  return typeof current === "number" ? current : parseFloat(String(current));
}

async function fetchBloomreachAnalysis(
  connection: Connection,
  analysisId: string,
  analysisType: string
): Promise<Record<string, unknown>> {
  const authString = btoa(
    `${connection.api_key_id}:${connection.api_secret_encrypted}`
  );

  const url = `${connection.api_url}/analytics/v3/${connection.project_token}/${analysisType}/${analysisId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Bloomreach API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active connections
    const { data: connections, error: connError } = await supabase
      .from("connections")
      .select("*")
      .eq("is_active", true);

    if (connError) throw connError;

    const results: {
      connection_id: string;
      metrics_synced: number;
      errors: string[];
    }[] = [];

    for (const connection of connections || []) {
      const connResult = {
        connection_id: connection.id,
        metrics_synced: 0,
        errors: [] as string[],
      };

      // Get all metric definitions for features in this org
      const { data: metrics, error: metricError } = await supabase
        .from("metric_definitions")
        .select(
          `
          id,
          bloomreach_analysis_id,
          analysis_type,
          value_extraction_path,
          feature_id,
          features!inner(organization_id)
        `
        )
        .eq("features.organization_id", connection.organization_id);

      if (metricError) {
        connResult.errors.push(`Failed to fetch metrics: ${metricError.message}`);
        results.push(connResult);
        continue;
      }

      for (const metric of (metrics as unknown as MetricDefinition[]) || []) {
        try {
          const rawResponse = await fetchBloomreachAnalysis(
            connection,
            metric.bloomreach_analysis_id,
            metric.analysis_type
          );

          const value = extractValue(
            rawResponse,
            metric.value_extraction_path.path
          );
          const today = new Date().toISOString().split("T")[0];

          const { error: upsertError } = await supabase
            .from("metric_snapshots")
            .upsert(
              {
                metric_definition_id: metric.id,
                snapshot_date: today,
                value,
                raw_response: rawResponse,
                synced_at: new Date().toISOString(),
              },
              {
                onConflict: "metric_definition_id,snapshot_date",
              }
            );

          if (upsertError) {
            connResult.errors.push(
              `Failed to upsert snapshot for ${metric.id}: ${upsertError.message}`
            );
          } else {
            connResult.metrics_synced++;
          }
        } catch (err) {
          connResult.errors.push(
            `Failed to sync metric ${metric.id}: ${(err as Error).message}`
          );
        }
      }

      // Update connection sync status
      await supabase
        .from("connections")
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status:
            connResult.errors.length === 0 ? "success" : "partial_failure",
          last_sync_error:
            connResult.errors.length > 0
              ? connResult.errors.join("; ")
              : null,
        })
        .eq("id", connection.id);

      results.push(connResult);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
