"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BellRing, Check } from "lucide-react";
import type { AlertDTO } from "@/lib/api/alerts";
import { followUpOnAlert } from "@/lib/api/alerts-actions";

export function AlertsList({ alerts }: { alerts: AlertDTO[] }) {
  const [followedUp, setFollowedUp] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function handleFollowUp(alert: AlertDTO) {
    startTransition(async () => {
      try {
        await followUpOnAlert(alert);
        setFollowedUp((prev) => new Set(prev).add(alert.id));
      } catch {
        // Leave the button in its current state so the user can retry.
      }
    });
  }

  return (
    <div className="grid gap-4">
      {alerts.map((alert) => {
        const isFollowedUp = followedUp.has(alert.id);
        return (
          <Card key={alert.id} className="border-l-4 border-l-destructive">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {alert.severity === "high" ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
                  ) : (
                    <BellRing className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  )}
                  <CardTitle className="text-base">{alert.entity}</CardTitle>
                </div>
                <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>{alert.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between py-2 pb-4">
              <p className="text-sm text-muted-foreground">{alert.message}</p>
              <Button
                size="sm"
                variant={isFollowedUp ? "secondary" : "outline"}
                disabled={isFollowedUp || isPending}
                onClick={() => handleFollowUp(alert)}
              >
                {isFollowedUp ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" /> Followed up
                  </>
                ) : (
                  "Follow Up"
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
