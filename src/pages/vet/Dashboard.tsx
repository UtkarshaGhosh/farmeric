import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getVetStats, listLatestAlerts, listFarmsWithLatestAssessment } from "@/integrations/supabase/api";
import { Input } from "@/components/ui/input";

export default function VetDashboard() {
  const [stats, setStats] = useState<{ totalFarms: number; highRiskFarms: number; pendingCompliance: number }>({ totalFarms: 0, highRiskFarms: 0, pendingCompliance: 0 });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [districtFilter, setDistrictFilter] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [s, a, f] = await Promise.all([getVetStats(), listLatestAlerts(5), listFarmsWithLatestAssessment()]);
      if (!mounted) return;
      setStats(s);
      setAlerts(a);
      setFarms(f);
    })();
    return () => { mounted = false; };
  }, []);

  const districts = useMemo(() => {
    const all = new Set<string>();
    for (const f of farms) if (f.district) all.add(f.district);
    for (const a of alerts) if (a.district) all.add(a.district);
    return Array.from(all);
  }, [farms, alerts]);

  const filteredFarms = useMemo(() => {
    if (!districtFilter) return farms;
    return farms.filter((f)=> (f.district||"").toLowerCase() === districtFilter.toLowerCase());
  }, [farms, districtFilter]);
  const filteredAlerts = useMemo(() => {
    if (!districtFilter) return alerts;
    return alerts.filter((a)=> (a.district||"").toLowerCase() === districtFilter.toLowerCase());
  }, [alerts, districtFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vet Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of farms, risks and alerts</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Total Farms" value={stats.totalFarms} />
        <StatCard label="High Risk Farms" value={stats.highRiskFarms} />
        <StatCard label="Pending Compliance" value={stats.pendingCompliance} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farm & Outbreak Map</CardTitle>
          <CardDescription>Filter by district</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <Input placeholder="Filter by district" value={districtFilter} onChange={(e)=>setDistrictFilter(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3 min-h-40 text-sm">
              <div className="font-medium mb-2">Farms</div>
              <div className="space-y-2 max-h-60 overflow-auto">
                {filteredFarms.map((f:any)=> (
                  <div key={f.id} className="flex items-center justify-between border rounded-md p-2">
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-muted-foreground text-xs">{f.district || '—'}{f.state?`, ${f.state}`:''}</div>
                    </div>
                    <div className="text-xs uppercase">{f.risk_level || 'unknown'}</div>
                  </div>
                ))}
                {filteredFarms.length===0 && <div className="text-xs text-muted-foreground">No farms</div>}
              </div>
            </div>
            <div className="border rounded-lg p-3 min-h-40 text-sm">
              <div className="font-medium mb-2">Outbreaks</div>
              <div className="space-y-2 max-h-60 overflow-auto">
                {filteredAlerts.map((a:any)=> (
                  <div key={a.alert_id || a.id} className="flex items-center justify-between border rounded-md p-2">
                    <div>
                      <div className="font-medium">{a.disease_name}</div>
                      <div className="text-muted-foreground text-xs">{a.district || '—'}{a.state?`, ${a.state}`:''}</div>
                    </div>
                    <div className="text-xs uppercase">{a.severity}</div>
                  </div>
                ))}
                {filteredAlerts.length===0 && <div className="text-xs text-muted-foreground">No alerts</div>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {alerts.map((a:any)=> (
              <div key={a.alert_id || a.id} className="border rounded-md p-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.disease_name}</div>
                  <div className="text-xs text-muted-foreground">{a.issued_date ? new Date(a.issued_date).toLocaleDateString() : ''}</div>
                </div>
                <div className="text-xs uppercase">{a.severity}</div>
              </div>
            ))}
            {alerts.length===0 && <div className="text-xs text-muted-foreground">No recent alerts</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({label, value}:{label:string; value:number|string}){
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
