import { EntitySidebar } from "@/components/layout/EntitySidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function EntityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <EntitySidebar />
      <main className="flex-1 flex flex-col">
        <TopNav role="Entity Officer" entityName="Arts & Culture Trust" />
        <div className="flex-1 p-6 space-y-6">{children}</div>
      </main>
    </div>
  );
}