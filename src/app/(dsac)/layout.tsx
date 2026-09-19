import { Globe, AlertTriangle, FileText } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { readSession } from "@/lib/auth/session";
import { getAlerts } from "@/lib/api/alerts";

const NAV_ITEMS = [
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: <Globe className="h-4 w-4" aria-hidden="true" />,
  },
  {
    href: "/submissions",
    label: "APP Submissions",
    icon: <FileText className="h-4 w-4" aria-hidden="true" />,
  },
  {
    href: "/alerts",
    label: "Alerts & Risk",
    icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
  },
];

export default async function DSACLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, alerts] = await Promise.all([readSession(), getAlerts()]);

  return (
    <div className="flex h-screen w-full p-4 gap-4 overflow-hidden bg-[#f5f7fb]">
      <Sidebar
        navItems={NAV_ITEMS}
        userInitial={session?.displayName.charAt(0) ?? "?"}
        userName={session?.displayName ?? "Unknown"}
        userSubtitle={session?.title ?? ""}
      />
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
        <TopNav 
          role={session?.title ?? "DSAC"} 
          alertCount={alerts.length} 
        />
        <main className="flex-1 overflow-y-auto rounded-2xl border bg-card p-6 shadow-lg relative">
          {children}
        </main>
      </div>
    </div>
  );
}