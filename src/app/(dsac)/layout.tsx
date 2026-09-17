import { Globe, AlertTriangle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { readSession } from "@/lib/auth/session";
import { getAlerts } from "@/lib/api/alerts";

const NAV_ITEMS = [
  { href: "/portfolio", label: "Portfolio", icon: <Globe className="h-4 w-4" aria-hidden="true" /> },
  { href: "/alerts", label: "Alerts & Risk", icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" /> },
];

export default async function DSACLayout({ children }: { children: React.ReactNode }) {
  const [session, alerts] = await Promise.all([readSession(), getAlerts()]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        navItems={NAV_ITEMS}
        userInitial={session?.displayName.charAt(0) ?? "?"}
        userName={session?.displayName ?? "Unknown"}
        userSubtitle={session?.title ?? ""}
      />
      <main className="flex-1 flex flex-col">
        <TopNav role={session?.title ?? "DSAC"} alertCount={alerts.length} />
        <div className="flex-1 p-6 space-y-6">{children}</div>
      </main>
    </div>
  );
}