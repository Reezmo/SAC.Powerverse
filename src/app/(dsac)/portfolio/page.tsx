import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getEntities } from "@/lib/api/entities";

export default async function DSACPortfolioPage() {
  const entities = await getEntities();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        Portfolio Overview ({entities.length} Entities)
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Entity Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity Name</TableHead>
                <TableHead>Submission Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Performance Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/entities/${entity.slug}`}
                      className="hover:underline focus-visible:underline focus-visible:outline-none"
                    >
                      {entity.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entity.status === "Submitted" ? "default" : "secondary"
                      }
                    >
                      {entity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entity.risk === "High"
                          ? "destructive"
                          : entity.risk === "Watch"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {entity.risk}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {entity.score}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
