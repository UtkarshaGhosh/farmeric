import { AlertTriangle, MapPin, Calendar } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DiseaseAlertData {
  id: string;
  diseaseName: string;
  description: string;
  location: string;
  distance: string;
  severity: "low" | "medium" | "high";
  issuedDate: string;
  issuedBy: string;
}

interface DiseaseAlertProps {
  alerts: DiseaseAlertData[];
}

export function DiseaseAlert({ alerts }: DiseaseAlertProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-risk-low-bg text-risk-low border-risk-low";
      case "medium": return "bg-risk-medium-bg text-risk-medium border-risk-medium";
      case "high": return "bg-risk-high-bg text-risk-high border-risk-high";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Disease Alerts</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-success/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-success" />
            </div>
            <p className="text-muted-foreground">No active disease alerts in your area</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Disease Alerts</h3>
          <Badge variant="destructive">{alerts.length} Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{alert.diseaseName}</h4>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {alert.description}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{alert.location} ({alert.distance})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{alert.issuedDate}</span>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Issued by: {alert.issuedBy}
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  );
}