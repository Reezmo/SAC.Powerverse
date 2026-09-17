import { DSACSidebar } from "@/components/layout/DSACSidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function DSACLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DSACSidebar />
      <main className="flex-1 flex flex-col">
        <TopNav role="DSAC M&E / Compliance" />
        <div className="flex-1 p-6 space-y-6">{children}</div>
      </main>
    </div>
  );
}