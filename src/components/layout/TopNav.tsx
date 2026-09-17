import { Bell, UserCircle } from "lucide-react";

export function TopNav({ role, entityName }: { role: string; entityName?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">SAC Powerverse</p>
          <h1 className="text-lg font-bold">{role}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden rounded-full bg-secondary px-3 py-1.5 text-sm font-medium sm:block">
            {entityName ?? "DSAC Portfolio"}
          </div>
          <button className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">3</span>
          </button>
          <UserCircle className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}