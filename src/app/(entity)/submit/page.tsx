import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";

export default function EntitySubmitPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quarterly APP Status - Q3 2026</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="jobs">Job Creation (Actual)</Label>
              <Input id="jobs" type="number" placeholder="Enter number of jobs created" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget">Budget Spent (ZAR)</Label>
              <Input id="budget" type="number" placeholder="e.g. 1500000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Variance Notes</Label>
              <Input id="notes" placeholder="Explain any deviations from target" />
            </div>
            <Button className="w-full mt-4">Save KPI Submission</Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckSquare className="h-5 w-5" /> Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-4 w-4 rounded-full border border-emerald-500 bg-emerald-500/20" /> 
              <span>Strategic Plan Uploaded</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-4 w-4 rounded-full border border-amber-500" /> 
              <span>Financials Attached</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}