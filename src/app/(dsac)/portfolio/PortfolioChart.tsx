"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateKpiModal } from "@/components/submit/CreateKpiModal";
import type { IndicatorSummary } from "@/lib/types/schema";

export function PortfolioChart({
  data,
  slugByEntityId,
}: {
  data: IndicatorSummary[];
  slugByEntityId: Record<string, string>;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleBarClick(entry: { payload?: IndicatorSummary }) {
    const entityId = entry.payload?.entityId;
    const slug = entityId ? slugByEntityId[entityId] : undefined;
    if (slug) {
      router.push(`/entities/${slug}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Portfolio Overview</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Create KPI Schema
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entity Task Completion Tracking</CardTitle>
          <CardDescription>
            Monitoring AI-extracted tasks across 26 Public Entities and 6 NPOs.
            Red represents incomplete tasks; Green represents completed tasks.
            Click a bar to view that entity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <XAxis
                  dataKey="entityName"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickFormatter={(tick) => `${tick}%`} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="percentComplete"
                  name="Completed Tasks"
                  fill="#10b981"
                  onClick={handleBarClick}
                  cursor="pointer"
                />
                <Bar
                  dataKey="percentRemaining"
                  name="Tasks Remaining"
                  fill="#ef4444"
                  onClick={handleBarClick}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <CreateKpiModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}