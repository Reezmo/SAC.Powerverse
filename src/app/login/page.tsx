"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithCredentials } from "@/lib/auth/actions";
import { TEST_CREDENTIALS } from "@/lib/auth/roles";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    
    const result = await loginWithCredentials(formData);
    
    // If the server action returns an error object instead of redirecting
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        
        {/* Main Login Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">SAC Powerverse</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="name@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Developer Hints for Testing */}
        <Card className="bg-muted/50 border-dashed">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm text-muted-foreground">Testing Credentials</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-muted-foreground">
            <div className="flex justify-between border-b pb-1">
              <span><strong>Thandi</strong> (Active KPI):</span>
              <span>{TEST_CREDENTIALS.thandi.email}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span><strong>Bianca</strong> (Pending KPI):</span>
              <span>{TEST_CREDENTIALS.bianca.email}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span><strong>Sipho</strong> (DSAC Oversight):</span>
              <span>{TEST_CREDENTIALS.sipho.email}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span><strong>DG</strong> (DSAC Exec):</span>
              <span>{TEST_CREDENTIALS.exec.email}</span>
            </div>
            <div className="pt-2 text-center font-medium ">
              Password for all: <span className="text-foreground">Password123!</span>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}