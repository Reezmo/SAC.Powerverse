import { getAlerts } from "@/lib/api/alerts";
import { AlertsList } from "@/components/alerts/AlertsList";

export default async function DSACAlertsPage() {
  const alerts = await getAlerts();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Risk & Escalations</h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No open alerts right now — everything is on track.</p>
      ) : (
        <AlertsList alerts={alerts} />
      )}
    </div>
  );
}
