import { DiseaseAlert } from "@/components/DiseaseAlert";

const diseaseAlerts = [
  {
    id: "1",
    diseaseName: "Avian Influenza H5N1",
    description: "High pathogenicity avian influenza detected in commercial poultry farm.",
    location: "Riverside County",
    distance: "12 km away",
    severity: "high" as const,
    issuedDate: "2024-03-15",
    issuedBy: "State Veterinary Office"
  },
  {
    id: "2",
    diseaseName: "African Swine Fever",
    description: "ASF outbreak confirmed in domestic pig population.",
    location: "Northern District",
    distance: "25 km away",
    severity: "medium" as const,
    issuedDate: "2024-03-12",
    issuedBy: "Regional Veterinary Unit"
  }
];

export const AlertsTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-destructive/10 to-destructive/20 p-4 rounded-xl border border-destructive/20">
        <h2 className="text-lg font-semibold text-destructive mb-2">Active Alerts</h2>
        <p className="text-sm text-muted-foreground">2 disease outbreaks in your area</p>
      </div>

      <DiseaseAlert alerts={diseaseAlerts} />
    </div>
  );
};