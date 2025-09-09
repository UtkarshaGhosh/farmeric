import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createAlert, listAlertsHistory } from "@/integrations/supabase/api";
import { useToast } from "@/hooks/use-toast";

export default function VetOutbreaks(){
  const { toast } = useToast();
  const [disease, setDisease] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(()=>{ (async ()=>{ const h = await listAlertsHistory(20); setHistory(h); })(); },[]);

  async function submit(e: React.FormEvent){
    e.preventDefault();
    await createAlert({ disease_name: disease, description: notes, district, state: stateName, severity: severity.toLowerCase(), issued_by: 'vet' });
    toast({ title: 'Outbreak reported' });
    setDisease(""); setSeverity("Medium"); setDistrict(""); setStateName(""); setNotes("");
    const h = await listAlertsHistory(20); setHistory(h);
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <form className="space-y-3" onSubmit={submit}>
        <div className="space-y-1">
          <Label>Disease Name</Label>
          <Input value={disease} onChange={(e)=>setDisease(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Severity</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>District</Label>
            <Input value={district} onChange={(e)=>setDistrict(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>State</Label>
            <Input value={stateName} onChange={(e)=>setStateName(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Notes</Label>
          <Input value={notes} onChange={(e)=>setNotes(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">Submit Report</Button>
      </form>

      <div className="space-y-2">
        <div className="text-sm font-medium">Outbreak History</div>
        {history.map((h)=> (
          <Card key={h.alert_id || h.id} className="p-3 text-sm flex items-center justify-between">
            <div>
              <div className="font-medium">{h.disease_name}</div>
              <div className="text-xs text-muted-foreground">{h.issued_date ? new Date(h.issued_date).toLocaleDateString() : ''}</div>
            </div>
            <div className="text-xs uppercase">{h.severity}</div>
          </Card>
        ))}
        {history.length===0 && <div className="text-sm text-muted-foreground">No history yet.</div>}
      </div>
    </div>
  );
}
