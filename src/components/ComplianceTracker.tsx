import { Upload, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ComplianceRecord {
  id: string;
  documentType: string;
  fileName?: string;
  status: "pending" | "approved" | "rejected";
  submissionDate: string;
  reviewDate?: string;
}

interface ComplianceTrackerProps {
  records: ComplianceRecord[];
  completionRate: number;
}

export function ComplianceTracker({ records, completionRate }: ComplianceTrackerProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending": return <Clock className="h-4 w-4 text-warning" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Compliance Tracker</h3>
          <Badge variant="outline" className="bg-primary-muted text-primary">
            {completionRate}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(record.status)}
                <div>
                  <p className="font-medium text-sm">{record.documentType}</p>
                  {record.fileName && (
                    <p className="text-xs text-muted-foreground">{record.fileName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Submitted: {record.submissionDate}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(record.status)} variant="outline">
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <Button className="w-full" variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload New Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}