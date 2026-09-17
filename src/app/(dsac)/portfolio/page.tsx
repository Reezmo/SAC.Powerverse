import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const MOCK_ENTITIES = [
  { id: 1, name: "Arts & Culture Trust", status: "Submitted", risk: "Low", score: 92 },
  { id: 2, name: "National Heritage Council", status: "In Progress", risk: "Watch", score: 68 },
  { id: 3, name: "Pan South African Language Board", status: "Not Started", risk: "High", score: 45 },
];

export default function DSACPortfolioPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Portfolio Overview (32 Entities)</h2>
      
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
              {MOCK_ENTITIES.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium">{entity.name}</TableCell>
                  <TableCell>
                    <Badge variant={entity.status === "Submitted" ? "default" : "secondary"}>
                      {entity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={entity.risk === "High" ? "destructive" : entity.risk === "Watch" ? "outline" : "secondary"}>
                      {entity.risk}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{entity.score}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}   