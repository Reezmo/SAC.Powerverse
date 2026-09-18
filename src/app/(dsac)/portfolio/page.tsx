"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getIndicatorSummary } from "@/lib/api/indicators";
import type { IndicatorSummary } from "@/lib/types/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function DSACPortfolioPage() {
  const [data, setData] = useState<IndicatorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIndicatorSummary().then((summary) => {
      setData(summary);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Portfolio Overview</h2>

      <Card>
        <CardHeader>
          <CardTitle>Entity Task Completion Tracking</CardTitle>
          <CardDescription>
            Monitoring AI-extracted tasks across 26 Public Entities and 6 NPOs. 
            Red represents incomplete tasks; Green represents completed tasks[cite: 1].
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <Skeleton className="h-[400px] w-full" />
          ) : (
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
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend verticalAlign="top" height={36} />
                  {/* Double bar graph configuration[cite: 1] */}
                  <Bar dataKey="percentCompleted" name="Completed Tasks" fill="#10b981" />
                  <Bar dataKey="percentRemaining" name="Tasks Remaining" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}