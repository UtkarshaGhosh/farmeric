import { TrainingModuleCard } from "@/components/TrainingModuleCard";

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

export const TrainingTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 p-4 rounded-xl border border-primary/20">
        <h2 className="text-lg font-semibold text-primary mb-2">Training Progress</h2>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full" style={{ width: '60%' }}></div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">3 of 5 modules completed</p>
      </div>

      <div className="space-y-4">
        {trainingModules.map((module) => (
          <TrainingModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
};