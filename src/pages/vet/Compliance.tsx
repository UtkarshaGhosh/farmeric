import { useEffect, useState } from "react";
import { listPendingCompliance, setComplianceStatus } from "@/integrations/supabase/api";
import { Button } from "@/components/ui/button";

export default function VetCompliance() {
  const [rows, setRows] = useState<any[]>([]);

  async function refresh() {
    const r = await listPendingCompliance();
    setRows(r);
  }

  useEffect(()=>{ refresh(); },[]);

  async function handle(id: string | number, status: 'approved'|'rejected'){
    await setComplianceStatus(id, status);
    await refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
        <div>Document</div>
        <div>Farmer</div>
        <div>Date</div>
        <div>Status</div>
      </div>
      {rows.map((r)=> (
        <div key={r.record_id || r.id} className="grid grid-cols-4 gap-2 items-center text-sm border rounded-md p-2">
          <div className="font-medium">{r.document_type}</div>
          <div>{r.submitted_by || '—'}</div>
          <div>{r.submission_date ? new Date(r.submission_date).toLocaleDateString(): '—'}</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={()=>handle(r.record_id || r.id, 'approved')}>Approve</Button>
            <Button size="sm" variant="destructive" onClick={()=>handle(r.record_id || r.id, 'rejected')}>Reject</Button>
          </div>
        </div>
      ))}
      {rows.length===0 && <div className="text-sm text-muted-foreground">No pending submissions.</div>}
    </div>
  );
}
