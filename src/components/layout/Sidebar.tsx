"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
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
    <aside className="w-64 shrink-0 flex flex-col h-full bg-card rounded-2xl border shadow-sm overflow-hidden justify-between">
      
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        
        <div className="h-16 shrink-0 flex items-center px-6 border-b">
          <span className="font-extrabold text-xl tracking-tight text-foreground">Powerverse</span>
        </div>

        {/* Enhanced User Profile */}
        <div className="p-5 shrink-0 border-b bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border border-blue-200">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-bold text-sm truncate text-foreground">{userName}</p>
              <p className="text-xs font-medium text-muted-foreground truncate">{userSubtitle}</p>
            </div>
          </div>
        </div>
        
        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5" aria-label="Primary">
          <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Main Menu
          </div>
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Firmly pinned to the bottom */}
      <div className="shrink-0 bg-card border-t p-4 mt-auto">
        {/* DSAC Compliance Hub Card */}
        <div className="relative rounded-xl bg-primary p-5 text-center mt-5 pt-8 shadow-md">
          {/* Floating Icon */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-card p-1.5 rounded-full shadow-sm">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <Landmark className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          
          <h3 className="font-bold text-sm text-primary-foreground">Compliance Hub</h3>
          <p className="text-xs text-primary-foreground/80 mt-1.5 mb-5 leading-relaxed">
            Access official DSAC reporting guidelines and APP templates.
          </p>
          
          <Button 
            size="sm" 
            className="w-full text-xs font-bold bg-background text-primary hover:bg-muted hover:text-primary transition-colors" 
            asChild
          >
            <Link href="https://www.dsac.gov.za/" target="_blank" rel="noopener noreferrer">
              DSAC Guidelines
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}