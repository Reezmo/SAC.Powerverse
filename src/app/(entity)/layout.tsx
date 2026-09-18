import { LayoutDashboard, UploadCloud } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { readSession } from "@/lib/auth/session";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> },
  { href: "/documents", label: "Documents", icon: <UploadCloud className="h-4 w-4" aria-hidden="true" /> },
];

export default async function EntityLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  const entityId = session?.entityId;

  // Determine dynamic state to update the notification bell
  const hasUploaded = entityId === "3" ? (globalThis as any).__MOCK_BIANCA_UPLOADED : false;
  const isAppActive = entityId === "1" || hasUploaded;
  
  // 1 alert if the APP is pending, 0 alerts if it is active.
  const alertsCount = isAppActive ? 0 : 1; 

  return (
    <div className="flex min-h-screen">
      <Sidebar
        navItems={NAV_ITEMS}
        userInitial={session?.displayName.charAt(0) ?? "?"}
        userName={session?.displayName ?? "Unknown"}
        userSubtitle={session?.title ?? ""}
      />
      <main className="flex-1 flex flex-col">
        <TopNav role={session?.title ?? "Entity"} entityName={session?.entityName} alertCount={alertsCount} />
        <div className="flex-1 p-6 space-y-6">{children}</div>
      </main>
    </div>
  );
}