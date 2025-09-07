import { useState } from "react";
import { FarmHeader } from "@/components/FarmHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { DashboardTab } from "@/components/DashboardTab";
import { TrainingTab } from "@/components/TrainingTab";
import { ComplianceTab } from "@/components/ComplianceTab";
import { AlertsTab } from "@/components/AlertsTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Demo data - would come from Supabase in real implementation
  const farmerData = {
    name: "John Smith",
    farmName: "Green Valley Farm",
    riskLevel: "medium" as const,
    notifications: 3
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab farmerData={farmerData} />;
      case "training":
        return <TrainingTab />;
      case "compliance":
        return <ComplianceTab />;
      case "alerts":
        return <AlertsTab />;
      default:
        return <DashboardTab farmerData={farmerData} />;
    }
  };

  const trainingModules = [
    {
      id: "1",
      title: "Biosecurity Basics for Pig Farms",
      description: "Learn the fundamentals of farm biosecurity, including visitor protocols and equipment sanitation.",
      type: "video" as const,
      duration: "15 min",
      livestock: "pig" as const,
      completed: true,
      progress: 100
    },
    {
      id: "2", 
      title: "Poultry Health Management",
      description: "Comprehensive guide to maintaining poultry health through proper vaccination schedules.",
      type: "pdf" as const,
      duration: "20 min",
      livestock: "poultry" as const,
      completed: false,
      progress: 45
    },
    {
      id: "3",
      title: "Disease Prevention Quiz",
      description: "Test your knowledge on preventing common livestock diseases and biosecurity measures.",
      type: "quiz" as const,
      duration: "10 min", 
      livestock: "both" as const,
      completed: false
    }
  ];

  const complianceRecords = [
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
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <FarmHeader 
        farmerName={farmerData.name}
        farmName={farmerData.farmName}
        riskLevel={farmerData.riskLevel}
        notifications={farmerData.notifications}
      />
      
      <main className="p-4 max-w-md mx-auto">
        {renderTabContent()}
      </main>
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
