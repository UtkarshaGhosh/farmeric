import { Play, FileText, Trophy, Clock } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: "video" | "pdf" | "quiz";
  duration: string;
  livestock: "pig" | "poultry" | "both";
  completed: boolean;
  progress?: number;
}

interface TrainingModuleCardProps {
  module: TrainingModule;
}

export function TrainingModuleCard({ module }: TrainingModuleCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="h-4 w-4" />;
      case "pdf": return <FileText className="h-4 w-4" />;
      case "quiz": return <Trophy className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video": return "bg-blue-100 text-blue-700";
      case "pdf": return "bg-green-100 text-green-700";
      case "quiz": return "bg-purple-100 text-purple-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getLivestockColor = (livestock: string) => {
    switch (livestock) {
      case "pig": return "bg-orange-100 text-orange-700";
      case "poultry": return "bg-yellow-100 text-yellow-700";
      case "both": return "bg-primary-muted text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getTypeColor(module.type)}>
                {getTypeIcon(module.type)}
                <span className="ml-1 capitalize">{module.type}</span>
              </Badge>
              <Badge variant="outline" className={getLivestockColor(module.livestock)}>
                {module.livestock === "both" ? "All" : module.livestock}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm">{module.title}</h3>
          </div>
          {module.completed && (
            <Trophy className="h-5 w-5 text-success flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {module.description}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{module.duration}</span>
        </div>
        
        {module.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{module.progress}%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${module.progress}%` }}
              />
            </div>
          </div>
        )}
        
        <Button 
          className="w-full" 
          variant={module.completed ? "outline" : "default"}
        >
          {module.completed ? "Review" : "Start"}
        </Button>
      </CardContent>
    </Card>
  );
}