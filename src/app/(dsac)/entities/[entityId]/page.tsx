import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DSACEntityDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Arts & Culture Trust</h2>
          <p className="text-muted-foreground text-sm">Public Entity • Q3 2026 Reporting Cycle</p>
        </div>
        <Badge variant="default" className="text-sm py-1 px-3">Status: Submitted</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reported KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KPI</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Actual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Job Creation</TableCell>
                  <TableCell>400</TableCell>
                  <TableCell className="text-emerald-600 font-bold">421</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Budget Spend</TableCell>
                  <TableCell>R 10.4M</TableCell>
                  <TableCell>R 6.8M</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Trail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="font-medium">Q3_Financials_Signed.pdf</span>
              <span className="text-muted-foreground">Oct 12, 2026</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="font-medium">Beneficiary_List_v2.xlsx</span>
              <span className="text-muted-foreground">Oct 10, 2026</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}