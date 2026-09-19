import { Globe, AlertTriangle, ClipboardList, FileCheck } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { readSession } from "@/lib/auth/session";
import { getAlerts } from "@/lib/api/alerts";
import { ROUTE_ACCESS } from "@/lib/auth/roles";

const ALL_NAV_ITEMS = [
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: <Globe className="h-4 w-4" aria-hidden="true" />,
  },
  {
    href: "/alerts",
    label: "Alerts & Risk",
    icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
  },
  {
    href: "/submissions",
    label: "APP Submissions",
    icon: <FileCheck className="h-4 w-4" aria-hidden="true" />,
  },
];

export default async function DSACLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, alerts] = await Promise.all([readSession(), getAlerts()]);

  // Only show nav links the signed-in role can actually reach — otherwise a
  // link silently bounces the user back (see proxy.ts's ROUTE_ACCESS check).
  const allowedPrefixes = session ? ROUTE_ACCESS[session.role] : [];
  const navItems = ALL_NAV_ITEMS.filter((item) =>
    allowedPrefixes.some((prefix) => item.href.startsWith(prefix)),
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar
        navItems={navItems}
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
