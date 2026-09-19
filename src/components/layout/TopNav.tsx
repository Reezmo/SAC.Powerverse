import { Bell, Settings, Search, LogOut } from "lucide-react";
import { logout } from "@/lib/auth/actions";

export function TopNav({
  role,
  entityName,
  alertCount = 0,
  userName = "",
  userInitial = "",
}: {
  role: string;
  entityName?: string;
  alertCount?: number;
  userName?: string;
  userInitial?: string;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-card rounded-2xl border shadow-sm">
      {/* Left: Dynamic Context / Brand */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          {entityName ?? "DSAC Portfolio"}
        </h1>
      </div>

      {/* Right: Interactive Actions */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search placeholder"
            className="bg-[#f5f7fb] border-0 rounded-full pl-4 pr-10 h-10 w-64 text-sm focus:ring-2 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground transition-all"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
        </div>

        {/* Notifications & Settings Pill */}
        <div className="flex items-center gap-1 bg-[#f5f7fb] rounded-full px-1.5 h-10">
          <button
            type="button"
            className="relative p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-white transition-colors"
            aria-label={alertCount > 0 ? `${alertCount} unread notifications` : "Notifications"}
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 border border-[#f5f7fb]"></span>
            )}
          </button>
          <button
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-white transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
{/* 
        {/* Profile Pill using real session data */}
        {/* Logout Action */}
        <form action={logout}>
          <button
            type="submit"
            className="p-2 ml-1 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition-colors"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </header>
  );
}