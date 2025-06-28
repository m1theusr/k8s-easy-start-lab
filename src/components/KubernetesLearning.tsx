
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Terminal, Layers, BookOpen, Network, Database, Server, CirclePlay } from 'lucide-react';
import { RealTerminal } from './RealTerminal';
import { ThemeToggle } from './ThemeToggle';
import { ModuleSelector } from './ModuleSelector';
import { LessonList } from './LessonList';
import { kubernetesModules } from '@/data/kubernetesModules';

export const KubernetesLearning = () => {
  const [selectedModuleId, setSelectedModuleId] = useState(1);
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [modules, setModules] = useState(kubernetesModules);
  const [showTerminal, setShowTerminal] = useState(false);

  const selectedModule = modules.find(module => module.id === selectedModuleId);

  const markLessonComplete = (lessonId: number) => {
    setModules(prev => 
      prev.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => 
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        )
      }))
    );
  };

  const handleModuleSelect = (moduleId: number) => {
    setSelectedModuleId(moduleId);
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setCurrentLessonId(module.lessons[0].id);
    }
  };

  // Calculate overall progress
  const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = modules.reduce((acc, module) => 
    acc + module.lessons.filter(lesson => lesson.completed).length, 0
  );
  const overallProgress = (completedLessons / totalLessons) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-kubernetes-blue rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Aprenda Kubernetes</h1>
                <p className="text-sm text-muted-foreground">5 Módulos • 25 Lições</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="hidden sm:flex">
                Progresso: {Math.round(overallProgress)}%
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overall Progress Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
              Progresso Geral
            </CardTitle>
            <CardDescription>
              {completedLessons} de {totalLessons} lições concluídas em {modules.length} módulos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="w-full h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(overallProgress)}% do curso completo
            </p>
          </CardContent>
        </Card>

        {/* Module Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Escolha um Módulo</h2>
          <ModuleSelector 
            modules={modules}
            selectedModuleId={selectedModuleId}
            onModuleSelect={handleModuleSelect}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Lessons */}
          <div className="space-y-6">
            {selectedModule && (
              <LessonList 
                module={selectedModule}
                currentLessonId={currentLessonId}
                onLessonSelect={setCurrentLessonId}
                onLessonComplete={markLessonComplete}
              />
            )}
          </div>

          {/* Right Side - Terminal */}
          <div className="lg:sticky lg:top-8">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Terminal className="w-6 h-6 mr-2" />
                  Terminal Kubernetes
                </CardTitle>
                <CardDescription>
                  Container Ubuntu com kubectl e minikube
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showTerminal ? (
                  <RealTerminal />
                ) : (
                  <div className="text-center py-8">
                    <Terminal className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Inicie um container Docker real com Ubuntu, kubectl e minikube
                    </p>
                    <Button 
                      onClick={() => {
                        console.log("Botão de abrir terminal clicado");
                        setShowTerminal(true);
                      }}
                      className="k8s-gradient"
                    >
                      <CirclePlay className="w-4 h-4 mr-2" />
                      Abrir Terminal Docker
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Comandos Essenciais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Network className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">minikube start</span>
                  <span className="ml-2 text-muted-foreground">- Iniciar cluster</span>
                </div>
                <div className="flex items-center text-sm">
                  <Database className="w-4 h-4 mr-2 text-green-500" />
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">kubectl get pods</span>
                  <span className="ml-2 text-muted-foreground">- Listar pods</span>
                </div>
                <div className="flex items-center text-sm">
                  <Server className="w-4 h-4 mr-2 text-purple-500" />
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">kubectl get nodes</span>
                  <span className="ml-2 text-muted-foreground">- Listar nodes</span>
                </div>
                <div className="flex items-center text-sm">
                  <Layers className="w-4 h-4 mr-2 text-orange-500" />
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">kubectl get services</span>
                  <span className="ml-2 text-muted-foreground">- Listar services</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
