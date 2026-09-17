import Link from "next/link";
import { Globe, AlertTriangle } from "lucide-react";

export function DSACSidebar() {
  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-bold text-lg text-primary">Powerverse</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/portfolio" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent text-accent-foreground">
          <Globe className="h-4 w-4" /> Portfolio
        </Link>
        <Link href="/alerts" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent text-muted-foreground hover:text-accent-foreground">
          <AlertTriangle className="h-4 w-4" /> Alerts & Risk
        </Link>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">S</div>
          <div className="text-sm">
            <p className="font-medium">Sipho</p>
            <p className="text-xs text-muted-foreground">DSAC M&E</p>
          </div>
        </div>
      </div>
    </aside>
  );
}