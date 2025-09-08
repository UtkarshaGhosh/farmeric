import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { seedDemoData } from "@/integrations/supabase/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AdminSeed() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function runSeed() {
    setLoading(true);
    try {
      await seedDemoData();
      toast({ title: "Seeded demo data" });
      navigate("/", { replace: true });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin: Seed Demo Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Seeds training modules, alerts, a sample farm, a risk assessment, and a compliance record for the current user.</p>
          <Button className="w-full" onClick={runSeed} disabled={loading}>{loading ? 'Seeding…' : 'Seed Now'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
