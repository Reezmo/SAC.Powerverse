import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loginAs } from "@/lib/auth/actions";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SAC Powerverse</CardTitle>
          <CardDescription>Select a role to preview functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={loginAs.bind(null, "thandi")}>
            <Button type="submit" className="w-full h-12 text-md" variant="default">
              Login as Thandi (Entity Officer)
            </Button>
          </form>
          <form action={loginAs.bind(null, "sipho")}>
            <Button type="submit" className="w-full h-12 text-md" variant="secondary">
              Login as Sipho (DSAC Oversight)
            </Button>
          </form>
          <form action={loginAs.bind(null, "exec")}>
            <Button type="submit" className="w-full h-12 text-md" variant="outline">
              Login as DG (DSAC Executive)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}