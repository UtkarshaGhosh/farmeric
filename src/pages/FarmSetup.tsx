import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { createFarm, listMyFarms } from "@/integrations/firebase/api";
import { useNavigate } from "react-router-dom";

export default function FarmSetup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [livestock, setLivestock] = useState<"pig" | "poultry" | "">("");
  const [herdSize, setHerdSize] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const farms = await listMyFarms();
        if (farms && farms.length) navigate("/", { replace: true });
      } catch {}
    })();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !livestock) {
      toast({ title: "Fill required fields", description: "Farm name and livestock type are required" });
      return;
    }
    setLoading(true);
    try {
      await createFarm({ farm_name: name, location: { district, state: stateName }, livestock_type: livestock, herd_size: herdSize || 0 });
      toast({ title: "Farm created" });
      navigate("/");
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
          <CardTitle>Set up your farm</CardTitle>
          <CardDescription>Create a farm profile to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1">
              <Label htmlFor="name">Farm Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Green Valley Farm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="district">District</Label>
                <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="State" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Livestock Type</Label>
              <RadioGroup value={livestock} onValueChange={(v) => setLivestock(v as any)} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="pig" value="pig" />
                  <Label htmlFor="pig">Pig</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="poultry" value="poultry" />
                  <Label htmlFor="poultry">Poultry</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-1">
              <Label htmlFor="herd">Herd Size</Label>
              <Input id="herd" type="number" min={0} value={herdSize} onChange={(e) => setHerdSize(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Number of animals" />
            </div>
            <Button className="w-full" type="submit" disabled={loading || !name || !livestock}>Save Farm</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
