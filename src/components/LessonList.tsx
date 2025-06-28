
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LessonStep, KubernetesModule } from '@/data/kubernetesModules';
import { CheckCircle, Circle, CirclePlay } from 'lucide-react';

interface LessonListProps {
  module: KubernetesModule;
  currentLessonId: number;
  onLessonSelect: (lessonId: number) => void;
  onLessonComplete: (lessonId: number) => void;
}

export const LessonList: React.FC<LessonListProps> = ({
  module,
  currentLessonId,
  onLessonSelect,
  onLessonComplete
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{module.title}</h2>
        <p className="text-muted-foreground">{module.description}</p>
      </div>
      
      {module.lessons.map((lesson) => (
        <Card 
          key={lesson.id} 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            currentLessonId === lesson.id ? 'ring-2 ring-kubernetes-blue shadow-lg' : ''
          } ${lesson.completed ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : ''}`}
          onClick={() => onLessonSelect(lesson.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {lesson.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground mr-3" />
                )}
                <div>
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {lesson.description}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={lesson.completed ? "default" : "secondary"}>
                Lição {lesson.id}
              </Badge>
            </div>
          </CardHeader>
          
          {currentLessonId === lesson.id && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Comandos para executar:</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    {lesson.commands.map((command, idx) => (
                      <div key={idx} className="mb-1">
                        <span className="text-blue-400">$</span> {command}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Explicação:</h4>
                  <p className="text-muted-foreground">{lesson.explanation}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onLessonComplete(lesson.id);
                    }}
                    disabled={lesson.completed}
                    className="k8s-gradient"
                  >
                    <CirclePlay className="w-4 h-4 mr-2" />
                    {lesson.completed ? 'Concluída' : 'Marcar como Concluída'}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
