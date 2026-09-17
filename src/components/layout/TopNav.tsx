import { Bell, UserCircle, LogOut } from "lucide-react";
import { logout } from "@/lib/auth/actions";

export function TopNav({
  role,
  entityName,
  alertCount = 0,
}: {
  role: string;
  entityName?: string;
  alertCount?: number;
}) {
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
          <button
            type="button"
            className="relative text-muted-foreground hover:text-foreground"
            aria-label={alertCount > 0 ? `${alertCount} unread notifications` : "Notifications"}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {alertCount}
              </span>
            )}
          </button>
          <UserCircle className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
