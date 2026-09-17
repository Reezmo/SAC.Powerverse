"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: React.ReactNode; // Updated from LucideIcon
}

export interface SidebarProps {
  navItems: SidebarNavItem[];
  userInitial: string;
  userName: string;
  userSubtitle: string;
}

export function Sidebar({ navItems, userInitial, userName, userSubtitle }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r bg-card flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-bold text-lg text-primary">Powerverse</span>
      </div>
      <nav className="flex-1 p-4 space-y-2" aria-label="Primary">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold"
            aria-hidden="true"
          >
            {userInitial}
          </div>
          <div className="text-sm">
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{userSubtitle}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}