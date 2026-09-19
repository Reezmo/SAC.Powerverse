import { getIndicatorSummary } from "@/lib/api/indicators";
import { getEntities } from "@/lib/api/entities";
import { PortfolioChart } from "./PortfolioChart";

export const dynamic = "force-dynamic";

export default async function DSACPortfolioPage() {
  // Fetch real data on the server securely
  const [summary, entities] = await Promise.all([
    getIndicatorSummary(),
    getEntities(),
  ]);

  // Map entity IDs to slugs for the chart's click-through navigation
  const slugMap: Record<string, string> = {};
  entities.forEach((e) => {
    slugMap[e.id] = e.slug;
  });

  return (
    <div className="space-y-6">
      <PortfolioChart data={summary} slugByEntityId={slugMap} />
    </div>
  );
}