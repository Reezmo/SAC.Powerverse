import Link from "next/link";
import { LayoutDashboard, FileText, UploadCloud } from "lucide-react";

export function EntitySidebar() {
  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-bold text-lg text-primary">Powerverse</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent text-accent-foreground">
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Link>
        <Link href="/submit" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent text-muted-foreground hover:text-accent-foreground">
          <FileText className="h-4 w-4" /> Submit KPI
        </Link>
        <Link href="/documents" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent text-muted-foreground hover:text-accent-foreground">
          <UploadCloud className="h-4 w-4" /> Documents
        </Link>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">T</div>
          <div className="text-sm">
            <p className="font-medium">Thandi</p>
            <p className="text-xs text-muted-foreground">Entity Officer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}