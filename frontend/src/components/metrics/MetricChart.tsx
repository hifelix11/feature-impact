import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { formatDate } from "@/lib/utils";
import type { MetricSnapshot } from "@/lib/api";

interface MetricChartProps {
  snapshots: MetricSnapshot[];
  deployDate: string;
  metricName: string;
  unit: string;
}

export function MetricChart({
  snapshots,
  deployDate,
  metricName,
  unit,
}: MetricChartProps) {
  if (snapshots.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-secondary">
        No data available yet. Snapshots will appear once metrics are collected.
      </div>
    );
  }

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const data = sorted.map((s) => ({
    date: s.timestamp,
    value: s.value,
    period: s.period_type,
  }));

  const deployTime = new Date(deployDate).getTime();

  const preData = data.filter(
    (d) => new Date(d.date).getTime() <= deployTime
  );
  const postData = data.filter(
    (d) => new Date(d.date).getTime() > deployTime
  );

  const preStart = preData.length > 0 ? preData[0].date : undefined;
  const preEnd = preData.length > 0 ? preData[preData.length - 1].date : undefined;
  const postStart = postData.length > 0 ? postData[0].date : undefined;
  const postEnd = postData.length > 0 ? postData[postData.length - 1].date : undefined;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
          <XAxis
            dataKey="date"
            tickFormatter={(val) => formatDate(val)}
            tick={{ fontSize: 11, fill: "#999" }}
            axisLine={{ stroke: "#E5E5E5" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#999" }}
            axisLine={false}
            tickLine={false}
            width={50}
            tickFormatter={(val) => `${val}${unit ? ` ${unit}` : ""}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E5E5",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            labelFormatter={(val) => formatDate(val as string)}
            formatter={(value: number) => [
              `${value.toFixed(2)}${unit ? ` ${unit}` : ""}`,
              metricName,
            ]}
          />
          {preStart && preEnd && (
            <ReferenceArea
              x1={preStart}
              x2={preEnd}
              fill="#E8F4FD"
              fillOpacity={0.4}
              label={{ value: "Pre", fontSize: 10, fill: "#999" }}
            />
          )}
          {postStart && postEnd && (
            <ReferenceArea
              x1={postStart}
              x2={postEnd}
              fill="#E8F8EF"
              fillOpacity={0.4}
              label={{ value: "Post", fontSize: 10, fill: "#999" }}
            />
          )}
          <ReferenceLine
            x={deployDate}
            stroke="#0D99FF"
            strokeDasharray="4 4"
            strokeWidth={2}
            label={{
              value: "Deploy",
              fontSize: 11,
              fill: "#0D99FF",
              position: "top",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0D99FF"
            strokeWidth={2}
            dot={{ r: 3, fill: "#0D99FF", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#0D99FF", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
