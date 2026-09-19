"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { CycleAggregateDTO } from "@/lib/types/schema";

export function PortfolioTrendChart({ cycles }: { cycles: CycleAggregateDTO[] }) {
  if (cycles.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Trend</CardTitle>
        <CardDescription>
          Submission status across reporting cycles, portfolio-wide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cycles} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis dataKey="cycleLabel" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="submittedCount" name="Submitted" stackId="a" fill="#10b981" />
              <Bar dataKey="otherCount" name="Other" stackId="a" fill="#f59e0b" />
              <Bar dataKey="missedCount" name="Missed" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
