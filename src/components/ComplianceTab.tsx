import { useEffect, useRef, useState } from "react";
import { listMyFarms, listComplianceRecordsByFarm, uploadComplianceDocument } from "@/integrations/supabase/api";
import { Button } from "@/components/ui/button";
import { ComplianceTracker } from "./ComplianceTracker";

const mockCompliance = [
  {
    id: "1",
    documentType: "Vaccination Certificate",
    fileName: "vaccination_Q1_2024.pdf",
    status: "approved" as const,
    submissionDate: "2024-01-15",
    reviewDate: "2024-01-18"
  },
  {
    id: "2",
    documentType: "Health Inspection Report",
    fileName: "health_inspection_march.pdf",
    status: "pending" as const,
    submissionDate: "2024-03-10"
  },
  {
    id: "3",
    documentType: "Feed Quality Certificate",
    status: "rejected" as const,
    submissionDate: "2024-02-28",
    reviewDate: "2024-03-05"
  }
];

export const ComplianceTab = () => {
  const [records, setRecords] = useState(mockCompliance);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const farms = await listMyFarms();
        if (farms[0]) setFarmId(farms[0].id);
        if (farms[0]) {
          const rows = await listComplianceRecordsByFarm(farms[0].id);
          const mapped = rows.map(r => ({
            id: r.record_id || r.id,
            documentType: r.document_type,
            fileName: r.file_url?.split('/').pop(),
            status: (String(r.status).toLowerCase()) as 'pending' | 'approved' | 'rejected',
            submissionDate: r.submission_date ? new Date(r.submission_date).toISOString().slice(0,10) : ""
          }));
          if (mapped.length) setRecords(mapped as any);
        }
      } catch (e) {
        // keep mock
      }
    })();
  }, []);

  const completionRate = Math.round((records.filter(r => r.status === 'approved').length / Math.max(1, records.length)) * 100);

  async function onUpload(file: File) {
    if (!farmId) return;
    setUploading(true);
    try {
      await uploadComplianceDocument(farmId, file, 'General Document');
      const rows = await listComplianceRecordsByFarm(farmId);
      const mapped = rows.map(r => ({
        id: r.record_id || r.id,
        documentType: r.document_type,
        fileName: r.file_url?.split('/').pop(),
        status: (String(r.status).toLowerCase()) as 'pending' | 'approved' | 'rejected',
        submissionDate: r.submission_date ? new Date(r.submission_date).toISOString().slice(0,10) : ""
      }));
      setRecords(mapped as any);
    } catch (e) {
      // ignore
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-warning/10 to-warning/20 p-4 rounded-xl border border-warning/20">
        <h2 className="text-lg font-semibold text-warning mb-2">Compliance Status</h2>
        <p className="text-sm text-muted-foreground">{records.filter(r => r.status === 'pending').length} documents pending review</p>
      </div>

      <ComplianceTracker
        records={records}
        completionRate={completionRate}
      />

      <div className="pt-2">
        <input ref={fileRef} type="file" className="hidden" onChange={e => e.target.files && onUpload(e.target.files[0])} />
        <Button className="w-full" variant="outline" onClick={() => fileRef.current?.click()} disabled={!farmId || uploading}>
          Upload New Document
        </Button>
      </div>
    </div>
  );
};
