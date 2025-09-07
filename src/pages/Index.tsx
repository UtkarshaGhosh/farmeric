import { FarmHeader } from "@/components/FarmHeader";
import { RiskAssessmentCard } from "@/components/RiskAssessmentCard";
import { TrainingModuleCard } from "@/components/TrainingModuleCard";
import { ComplianceTracker } from "@/components/ComplianceTracker";
import { DiseaseAlert } from "@/components/DiseaseAlert";

const Index = () => {
  // Demo data - would come from Supabase in real implementation
  const farmerData = {
    name: "John Smith",
    farmName: "Green Valley Farm",
    riskLevel: "medium" as const,
    notifications: 3
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
    <div className="min-h-screen bg-background">
      <FarmHeader 
        farmerName={farmerData.name}
        farmName={farmerData.farmName}
        riskLevel={farmerData.riskLevel}
        notifications={farmerData.notifications}
      />
      
      <main className="p-4 max-w-md mx-auto space-y-6">
        {/* Risk Assessment Section */}
        <RiskAssessmentCard 
          currentScore={75}
          maxScore={100}
          riskLevel={farmerData.riskLevel}
          lastAssessment="2 weeks ago"
          daysUntilNext={30}
        />

        {/* Disease Alerts */}
        <DiseaseAlert alerts={diseaseAlerts} />

        {/* Training Modules */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Training Modules</h2>
          <div className="space-y-4">
            {trainingModules.map((module) => (
              <TrainingModuleCard key={module.id} module={module} />
            ))}
          </div>
        </section>

        {/* Compliance Tracker */}
        <ComplianceTracker 
          records={complianceRecords}
          completionRate={67}
        />
      </main>
    </div>
  );
};

export default Index;
