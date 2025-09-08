import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getUserProfile, listAllFarms, listPendingCompliance, setComplianceStatus, listTrainingModules, upsertTrainingModule, createAlert } from "@/integrations/supabase/api";

export default function Vet() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState<any[]>([]);
  const [pendingCompliance, setPendingCompliance] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);

  // New module form
  const [modTitle, setModTitle] = useState("");
  const [modType, setModType] = useState("video");
  const [modLink, setModLink] = useState("");
  const [modLang, setModLang] = useState("en");
  const [modLivestock, setModLivestock] = useState("both");

  // Outbreak form
  const [disease, setDisease] = useState("");
  const [desc, setDesc] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [severity, setSeverity] = useState("medium");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await getUserProfile();
        if (!profile || profile.role !== 'vet') { navigate('/', { replace: true }); return; }
        const [f, c, m] = await Promise.all([
          listAllFarms(),
          listPendingCompliance(),
          listTrainingModules({}) as any,
        ]);
        if (!mounted) return;
        setFarms(f);
        setPendingCompliance(c);
        setModules(m);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const farmsByLivestock = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of farms) counts[f.livestock_type || 'unknown'] = (counts[f.livestock_type || 'unknown'] || 0) + 1;
    return counts;
  }, [farms]);

  async function approve(record_id: string) {
    await setComplianceStatus(record_id, 'approved');
    toast({ title: 'Approved' });
    const c = await listPendingCompliance();
    setPendingCompliance(c);
  }

  async function reject(record_id: string) {
    await setComplianceStatus(record_id, 'rejected');
    toast({ title: 'Rejected' });
    const c = await listPendingCompliance();
    setPendingCompliance(c);
  }

  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    await upsertTrainingModule({ title: modTitle, type: modType, link: modLink, language: modLang, livestock_type: modLivestock });
    toast({ title: 'Module saved' });
    setModTitle(""); setModLink("");
    const m = await (listTrainingModules({}) as any);
    setModules(m);
  }

  async function submitAlert(e: React.FormEvent) {
    e.preventDefault();
    await createAlert({ disease_name: disease, description: desc, district, state: stateName, severity, issued_by: 'vet' });
    toast({ title: 'Outbreak reported' });
    setDisease(""); setDesc(""); setDistrict(""); setStateName(""); setSeverity("medium");
  }

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Vet Console</CardTitle>
          <CardDescription>Monitor farms, review compliance, advise, and report outbreaks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={active} onValueChange={setActive}>
            <TabsList className="grid grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="farms">Farms</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="advisory">Advisory</TabsTrigger>
              <TabsTrigger value="outbreaks">Outbreaks</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Farms" value={farms.length} />
                <Stat label="Pending Compliance" value={pendingCompliance.length} />
                <Stat label="Training Modules" value={modules.length} />
              </div>
            </TabsContent>

            <TabsContent value="farms" className="mt-4 space-y-3">
              <div className="space-y-2">
                {farms.map((f) => (
                  <div key={f.id} className="border rounded-lg p-3 flex justify-between text-sm">
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-muted-foreground">{f.district || '—'}{f.state ? `, ${f.state}` : ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="uppercase text-xs">{f.livestock_type || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">Herd: {f.herd_size ?? 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="mt-4 space-y-3">
              {pendingCompliance.length === 0 && <div className="text-sm text-muted-foreground">No pending documents.</div>}
              {pendingCompliance.map((r) => (
                <div key={r.record_id || r.id} className="border rounded-lg p-3 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <div className="font-medium">{r.document_type}</div>
                    <div className="text-muted-foreground">Submitted: {r.submission_date ? new Date(r.submission_date).toLocaleDateString() : '—'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => approve(r.record_id || r.id)}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => reject(r.record_id || r.id)}>Reject</Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="advisory" className="mt-4 space-y-4">
              <form className="grid grid-cols-2 gap-3 items-end" onSubmit={addModule}>
                <div className="space-y-1">
                  <Label htmlFor="mtitle">Title</Label>
                  <Input id="mtitle" value={modTitle} onChange={(e) => setModTitle(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={modType} onValueChange={setModType}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mlink">Link</Label>
                  <Input id="mlink" value={modLink} onChange={(e) => setModLink(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Language</Label>
                  <Select value={modLang} onValueChange={setModLang}>
                    <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="bn">Bengali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Livestock</Label>
                  <Select value={modLivestock} onValueChange={setModLivestock}>
                    <SelectTrigger><SelectValue placeholder="Livestock" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pig">Pig</SelectItem>
                      <SelectItem value="poultry">Poultry</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button type="submit" className="w-full">Save Module</Button>
                </div>
              </form>

              <div className="space-y-2">
                {modules.map((m) => (
                  <div key={m.id} className="border rounded-lg p-3 text-sm">
                    <div className="font-medium">{m.title} <span className="text-xs text-muted-foreground">({m.type})</span></div>
                    <div className="text-muted-foreground text-xs">{m.language?.toUpperCase()} • {m.livestock_type || 'both'}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="outbreaks" className="mt-4">
              <form className="space-y-3" onSubmit={submitAlert}>
                <div className="space-y-1">
                  <Label htmlFor="disease">Disease</Label>
                  <Input id="disease" value={disease} onChange={(e) => setDisease(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="desc">Description</Label>
                  <Input id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={stateName} onChange={(e) => setStateName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Severity</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Report Outbreak</Button>
              </form>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(farmsByLivestock).map(([k, v]) => (
                  <Stat key={k} label={k.toUpperCase()} value={v as number} />
                ))}
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border rounded-lg p-3 text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
