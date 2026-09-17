import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SAC Powerverse</CardTitle>
          <CardDescription>Select a role to demo the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/dashboard" className="block">
            <Button className="w-full h-12 text-md" variant="default">
              Login as Thandi (Entity Officer)
            </Button>
          </Link>
          <Link href="/portfolio" className="block">
            <Button className="w-full h-12 text-md" variant="secondary">
              Login as Sipho (DSAC Oversight)
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}