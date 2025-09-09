import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { listFarmsWithLatestAssessment } from "@/integrations/supabase/api";

export default function VetFarms() {
  const [farms, setFarms] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [risk, setRisk] = useState<string>("all");
  const [district, setDistrict] = useState<string>("all");
  const [compliance] = useState<string>("all");

  useEffect(() => {
    let mounted = true;
    listFarmsWithLatestAssessment().then((f)=>{ if (mounted) setFarms(f); });
    return ()=>{ mounted=false; };
  }, []);

  const districts = useMemo(()=>{
    return Array.from(new Set(farms.map((f)=> f.district).filter(Boolean)));
  },[farms]);

  const filtered = useMemo(()=>{
    return farms.filter((f)=>{
      const matchesQ = q ? (`${f.id}`.toLowerCase().includes(q.toLowerCase()) || (f.name||'').toLowerCase().includes(q.toLowerCase())) : true;
      const matchesRisk = risk==='all' ? true : (String(f.risk_level||'').toLowerCase()===risk);
      const matchesDistrict = district==='all' ? true : (String(f.district||'').toLowerCase()===district.toLowerCase());
      return matchesQ && matchesRisk && matchesDistrict;
    });
  },[farms,q,risk,district]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <Input placeholder="Search by farm ID or farmer name" value={q} onChange={(e)=>setQ(e.target.value)} />
        <Select value={risk} onValueChange={setRisk}>
          <SelectTrigger><SelectValue placeholder="Risk Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map((d)=>(<SelectItem key={d} value={d}>{d}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map((f)=> (
          <Card key={f.id} className="p-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{f.name}</div>
              <div className="text-xs text-muted-foreground">{f.district || '—'}{f.state?`, ${f.state}`:''}</div>
            </div>
            <div className="text-right">
              <div className="uppercase text-xs">{f.risk_level || 'unknown'}</div>
              <div className="text-xs text-muted-foreground">Last: {f.last_assessed ? new Date(f.last_assessed).toLocaleDateString() : '—'}</div>
            </div>
          </Card>
        ))}
        {filtered.length===0 && <div className="text-sm text-muted-foreground">No farms match your filters.</div>}
      </div>
    </div>
  );
}
