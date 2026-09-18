import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listAppSubmissions } from "@/lib/api/apps";

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    case "ai_failed":
      return "destructive";
    default:
      return "secondary";
  }
}

export default async function AppSubmissionsPage() {
  const submissions = await listAppSubmissions();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">APP Submissions</h2>

      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No APP submissions yet.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.entityName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(submission.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(submission.status)}>{submission.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/submissions/${submission.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Review
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
