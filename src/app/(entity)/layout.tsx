import { LayoutDashboard, FileText, UploadCloud } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { readSession } from "@/lib/auth/session";
import { MOCK_CHECKLIST } from "@/lib/data/mockEntities";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> },
  { href: "/submit", label: "Submit KPI", icon: <FileText className="h-4 w-4" aria-hidden="true" /> },
  { href: "/documents", label: "Documents", icon: <UploadCloud className="h-4 w-4" aria-hidden="true" /> },
];

export default async function EntityLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  const pendingChecklistItems = MOCK_CHECKLIST.filter((c) => c.status === "pending").length;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        navItems={NAV_ITEMS}
        userInitial={session?.displayName.charAt(0) ?? "?"}
        userName={session?.displayName ?? "Unknown"}
        userSubtitle={session?.title ?? ""}
      />
      <main className="flex-1 flex flex-col">
        <TopNav role={session?.title ?? "Entity"} entityName={session?.entityName} alertCount={pendingChecklistItems} />
        <div className="flex-1 p-6 space-y-6">{children}</div>
      </main>
    </div>
  );
}