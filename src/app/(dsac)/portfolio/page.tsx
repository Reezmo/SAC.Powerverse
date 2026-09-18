import { getIndicatorSummary } from "@/lib/api/indicators";
import { getEntities } from "@/lib/api/entities";
import { PortfolioChart } from "./PortfolioChart";

export default async function DSACPortfolioPage() {
  const [summary, entities] = await Promise.all([getIndicatorSummary(), getEntities()]);

  const slugByEntityId = Object.fromEntries(
    entities.map((e) => [e.id, "slug" in e ? e.slug : ""]),
  );

  return <PortfolioChart data={summary} slugByEntityId={slugByEntityId} />;
}
