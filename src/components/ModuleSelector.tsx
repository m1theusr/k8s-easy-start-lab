
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KubernetesModule } from '@/data/kubernetesModules';
import { BookOpen, Box, Layers, Network, Database, CheckCircle } from 'lucide-react';

interface ModuleSelectorProps {
  modules: KubernetesModule[];
  selectedModuleId: number;
  onModuleSelect: (moduleId: number) => void;
}

const getModuleIcon = (iconName: string) => {
  const icons = {
    BookOpen,
    Box, 
    Layers,
    Network,
    Database
  };
  const IconComponent = icons[iconName as keyof typeof icons] || BookOpen;
  return IconComponent;
};

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  modules,
  selectedModuleId,
  onModuleSelect
}) => {
  const getModuleProgress = (module: KubernetesModule) => {
    const completedLessons = module.lessons.filter(lesson => lesson.completed).length;
    return (completedLessons / module.lessons.length) * 100;
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {modules.map((module) => {
        const IconComponent = getModuleIcon(module.icon);
        const progress = getModuleProgress(module);
        const completedLessons = module.lessons.filter(lesson => lesson.completed).length;
        const isSelected = selectedModuleId === module.id;
        
        return (
          <Card 
            key={module.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              isSelected ? 'ring-2 ring-kubernetes-blue shadow-lg' : ''
            }`}
            onClick={() => onModuleSelect(module.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <IconComponent className="w-8 h-8 text-kubernetes-blue mr-3" />
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={progress === 100 ? "default" : "secondary"}>
                  {progress === 100 ? <CheckCircle className="w-4 h-4 mr-1" /> : null}
                  Módulo {module.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{completedLessons}/{module.lessons.length} lições</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(progress)}% completo
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
