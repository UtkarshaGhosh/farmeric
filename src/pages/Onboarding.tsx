import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { upsertUserProfile } from "@/integrations/supabase/api";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [stateName, setStateName] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !district || !language) {
      toast({ title: "Fill required fields", description: "Name, district and language are required" });
      return;
    }
    setLoading(true);
    try {
      await upsertUserProfile({ name, location: { district, village, state: stateName }, language_preference: language });
      toast({ title: "Profile saved" });
      navigate("/farm-setup");
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
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Let's set up your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="district">District</Label>
                <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} required placeholder="District" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="village">Village</Label>
                <Input id="village" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Village" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="State" />
            </div>
            <div className="space-y-1">
              <Label>Preferred Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" type="submit" disabled={loading || !name || !district || !language}>Continue</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
