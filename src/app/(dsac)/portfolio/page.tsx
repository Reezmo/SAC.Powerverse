import { getIndicatorSummary } from "@/lib/api/indicators";
import { getEntities } from "@/lib/api/entities";
import { getPortfolioTrend } from "@/lib/api/trends";
import { PortfolioChart } from "./PortfolioChart";
import { PortfolioTrendChart } from "./PortfolioTrendChart";

export const dynamic = "force-dynamic";

export default async function DSACPortfolioPage() {
  // Fetch real data on the server securely
  const [summary, entities, trend] = await Promise.all([
    getIndicatorSummary(),
    getEntities(),
    getPortfolioTrend(),
  ]);

  // Map entity IDs to slugs for the chart's click-through navigation
  const slugMap: Record<string, string> = {};
  entities.forEach((e) => {
    slugMap[e.id] = e.slug;
  });

  return (
    <div className="space-y-6">
      <PortfolioChart data={summary} slugByEntityId={slugMap} />
      <PortfolioTrendChart cycles={trend.cycles} />
    </div>
  );
}