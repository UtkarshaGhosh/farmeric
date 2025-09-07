import { TrainingModuleCard } from "@/components/TrainingModuleCard";

import { useEffect, useState } from "react";
import { listTrainingModules } from "@/integrations/supabase/api";
import type { Enums } from "@/integrations/supabase/types";
import { TrainingModuleCard } from "./TrainingModuleCard";

const mockTraining = [
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
  const [modules, setModules] = useState(mockTraining);
  useEffect(() => {
    (async () => {
      try {
        const rows = await listTrainingModules({} as { livestock_type?: Enums<'livestock_type'>, language?: Enums<'language'>, type?: Enums<'module_type'> });
        const mapped = rows.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description || "",
          type: r.type,
          duration: r.type === 'video' ? '12 min' : r.type === 'pdf' ? '20 min' : '10 min',
          livestock: (r.livestock_type as any) as 'pig' | 'poultry' | 'both',
          completed: false,
          progress: r.type === 'video' ? 0 : undefined
        }));
        if (mapped.length) setModules(mapped as any);
      } catch (e) {
        // keep mock
      }
    })();
  }, []);

  const completed = modules.filter(m => m.completed).length;
  const total = modules.length;
  const percent = Math.round((completed / Math.max(1, total)) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 p-4 rounded-xl border border-primary/20">
        <h2 className="text-lg font-semibold text-primary mb-2">Training Progress</h2>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full" style={{ width: `${percent}%` }}></div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{completed} of {total} modules completed</p>
      </div>

      <div className="space-y-4">
        {modules.map((module) => (
          <TrainingModuleCard key={module.id} module={module as any} />
        ))}
      </div>
    </div>
  );
};
