// src/app/(app)/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">App Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your dashboard. This area uses the standard app theme.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Sample Card</CardTitle>
          <CardDescription>This card uses themed styles.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Content within the card.</p>
          <Button>Primary Action</Button>
          <Button variant="secondary" className="ml-2">Secondary</Button>
        </CardContent>
      </Card>
    </div>
  );
}