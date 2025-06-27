
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, BookOpen, Terminal, CheckCircle, Circle, Server, Network, Database } from 'lucide-react';
import { InteractiveTerminal } from './InteractiveTerminal';

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

export const KubernetesLearning: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="k8s-animated-bg text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Server className="w-12 h-12 mr-4" />
            <h1 className="text-5xl font-bold">Aprenda Kubernetes</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Um guia interativo e prático para dominar o Kubernetes do básico ao avançado
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => setShowTerminal(!showTerminal)}
            >
              <Terminal className="w-5 h-5 mr-2" />
              {showTerminal ? 'Ocultar Terminal' : 'Abrir Terminal Interativo'}
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
              <BookOpen className="w-5 h-5 mr-2" />
              Guia Completo
            </Button>
          </div>
        </div>
      </div>

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
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Lições Interativas</h2>
            
            {lessons.map((lesson, index) => (
              <Card 
                key={lesson.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  currentLesson === index ? 'ring-2 ring-kubernetes-blue shadow-lg' : ''
                } ${lesson.completed ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => setCurrentLesson(index)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {lesson.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 mr-3" />
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
                        <p className="text-gray-600">{lesson.explanation}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => markLessonComplete(lesson.id)}
                          disabled={lesson.completed}
                          className="k8s-gradient"
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {lesson.completed ? 'Concluída' : 'Marcar como Concluída'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Right Side - Interactive Terminal */}
          <div className="lg:sticky lg:top-8">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Terminal className="w-6 h-6 mr-2" />
                  Terminal Interativo
                </CardTitle>
                <CardDescription>
                  Execute comandos Kubernetes em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showTerminal ? (
                  <InteractiveTerminal />
                ) : (
                  <div className="text-center py-8">
                    <Terminal className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">
                      Clique no botão "Abrir Terminal Interativo" para começar a praticar
                    </p>
                    <Button 
                      onClick={() => setShowTerminal(true)}
                      className="k8s-gradient"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Iniciar Terminal
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
                  Referência Rápida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Network className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">kubectl get pods</span>
                  <span className="ml-2 text-gray-600">- Listar pods</span>
                </div>
                <div className="flex items-center text-sm">
                  <Database className="w-4 h-4 mr-2 text-green-500" />
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">kubectl get services</span>
                  <span className="ml-2 text-gray-600">- Listar serviços</span>
                </div>
                <div className="flex items-center text-sm">
                  <Server className="w-4 h-4 mr-2 text-purple-500" />
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">kubectl get nodes</span>
                  <span className="ml-2 text-gray-600">- Listar nodes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
