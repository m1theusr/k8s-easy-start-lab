import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Play, BookOpen, Terminal, Layers, Network, Database, Server, CirclePlay } from 'lucide-react';
import { RealTerminal } from './RealTerminal';
import { ThemeToggle } from './ThemeToggle';

interface LessonStep {
  id: number;
  title: string;
  description: string;
  commands: string[];
  explanation: string;
  completed: boolean;
}

const kubernetesLessons: LessonStep[] = [
  {
    id: 1,
    title: "Verificando Instalação do kubectl",
    description: "Primeiro, vamos verificar se o kubectl está instalado e funcionando",
    commands: ["kubectl version --client", "kubectl cluster-info"],
    explanation: "O kubectl é a ferramenta de linha de comando para interagir com clusters Kubernetes. Estes comandos verificam a versão e informações do cluster.",
    completed: false
  },
  {
    id: 2,
    title: "Listando Nodes do Cluster",
    description: "Vamos ver os nodes (nós) disponíveis no nosso cluster",
    commands: ["kubectl get nodes", "kubectl describe nodes"],
    explanation: "Nodes são as máquinas (físicas ou virtuais) onde os pods do Kubernetes são executados. Este comando mostra o status de cada node.",
    completed: false
  },
  {
    id: 3,
    title: "Criando seu Primeiro Pod",
    description: "Vamos criar um pod simples com nginx",
    commands: [
      "kubectl run nginx-pod --image=nginx:latest",
      "kubectl get pods",
      "kubectl describe pod nginx-pod"
    ],
    explanation: "Um Pod é a menor unidade executável no Kubernetes. Aqui criamos um pod com nginx e verificamos seu status.",
    completed: false
  },
  {
    id: 4,
    title: "Trabalhando com Deployments",
    description: "Vamos criar um deployment para gerenciar múltiplas réplicas",
    commands: [
      "kubectl create deployment nginx-deployment --image=nginx:latest --replicas=3",
      "kubectl get deployments",
      "kubectl get pods -l app=nginx-deployment"
    ],
    explanation: "Deployments gerenciam ReplicaSets e garantem que um número específico de pods esteja sempre em execução.",
    completed: false
  },
  {
    id: 5,
    title: "Expondo Serviços",
    description: "Vamos expor nosso deployment como um serviço",
    commands: [
      "kubectl expose deployment nginx-deployment --port=80 --type=NodePort",
      "kubectl get services",
      "kubectl describe service nginx-deployment"
    ],
    explanation: "Services fornecem uma forma estável de acessar pods, mesmo quando eles são recriados ou movidos.",
    completed: false
  }
];

export const KubernetesLearning = () => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [lessons, setLessons] = useState(kubernetesLessons);
  const [showTerminal, setShowTerminal] = useState(false);

  const markLessonComplete = (lessonId: number) => {
    setLessons(prev => 
      prev.map(lesson => 
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      )
    );
  };

  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const progressPercentage = (completedLessons / lessons.length) * 100;

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
                <p className="text-sm text-muted-foreground">Terminal Docker Real</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="hidden sm:flex">
                Progresso: {Math.round(progressPercentage)}%
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
              Seu Progresso
            </CardTitle>
            <CardDescription>
              {completedLessons} de {lessons.length} lições concluídas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="w-full h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progressPercentage)}% completo
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Lessons */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground mb-6">Lições Interativas</h2>
            
            {lessons.map((lesson, index) => (
              <Card 
                key={lesson.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  currentLesson === index ? 'ring-2 ring-kubernetes-blue shadow-lg' : ''
                } ${lesson.completed ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : ''}`}
                onClick={() => setCurrentLesson(index)}
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
                {currentLesson === index && (
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
                          onClick={() => markLessonComplete(lesson.id)}
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

          {/* Right Side - Real Terminal */}
          <div className="lg:sticky lg:top-8">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Terminal className="w-6 h-6 mr-2" />
                  Terminal Docker Real
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
                      onClick={() => setShowTerminal(true)}
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
                  Comandos Kubernetes
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
