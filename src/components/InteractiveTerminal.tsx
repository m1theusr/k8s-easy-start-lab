
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Play, RotateCcw, Server } from 'lucide-react';

interface TerminalOutput {
  command: string;
  output: string;
  timestamp: Date;
  isError?: boolean;
}

export const InteractiveTerminal: React.FC = () => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [containerStatus, setContainerStatus] = useState<'stopped' | 'starting' | 'running'>('stopped');
  const terminalRef = useRef<HTMLDivElement>(null);

  // Mock Kubernetes responses
  const mockResponses: Record<string, string> = {
    'kubectl version --client': `Client Version: version.Info{Major:"1", Minor:"28", GitVersion:"v1.28.0"}`,
    'kubectl cluster-info': `Kubernetes control plane is running at https://kubernetes.default.svc
CoreDNS is running at https://kubernetes.default.svc/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy`,
    'kubectl get nodes': `NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   1d    v1.28.0`,
    'kubectl get pods': `NAME                               READY   STATUS    RESTARTS   AGE
nginx-pod                         1/1     Running   0          5m
nginx-deployment-7d8c8b8bb-abc12  1/1     Running   0          3m
nginx-deployment-7d8c8b8bb-def34  1/1     Running   0          3m
nginx-deployment-7d8c8b8bb-ghi56  1/1     Running   0          3m`,
    'kubectl get services': `NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
kubernetes         ClusterIP   10.96.0.1       <none>        443/TCP        1d
nginx-deployment   NodePort    10.96.123.45    <none>        80:30080/TCP   2m`,
    'kubectl get deployments': `NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           3m`,
    'kubectl run nginx-pod --image=nginx:latest': `pod/nginx-pod created`,
    'kubectl create deployment nginx-deployment --image=nginx:latest --replicas=3': `deployment.apps/nginx-deployment created`,
    'kubectl expose deployment nginx-deployment --port=80 --type=NodePort': `service/nginx-deployment exposed`,
    'kubectl describe nodes': `Name:               minikube
Roles:              control-plane
Labels:             kubernetes.io/arch=amd64
                    kubernetes.io/hostname=minikube
                    kubernetes.io/os=linux
Annotations:        kubeadm.alpha.kubernetes.io/cri-socket: /var/run/containerd/containerd.sock
CreationTimestamp:  Thu, 01 Jan 2024 10:00:00 +0000
Taints:             <none>
Unschedulable:      false
Conditions:
  Type             Status
  ----             ------
  MemoryPressure   False
  DiskPressure     False
  PIDPressure      False
  Ready            True`,
    'help': `Comandos disponíveis:
• kubectl version --client - Verificar versão do kubectl
• kubectl cluster-info - Informações do cluster
• kubectl get nodes - Listar nodes
• kubectl get pods - Listar pods
• kubectl get services - Listar serviços
• kubectl get deployments - Listar deployments
• kubectl run nginx-pod --image=nginx:latest - Criar pod
• kubectl create deployment nginx-deployment --image=nginx:latest --replicas=3 - Criar deployment
• kubectl expose deployment nginx-deployment --port=80 --type=NodePort - Expor serviço
• clear - Limpar terminal
• help - Mostrar esta ajuda`,
    'clear': 'CLEAR_TERMINAL'
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const startContainer = async () => {
    setContainerStatus('starting');
    setIsLoading(true);
    
    // Simulate container startup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setContainerStatus('running');
    setIsLoading(false);
    setHistory([{
      command: 'system',
      output: '🐳 Container Ubuntu com kubectl iniciado com sucesso!\n💡 Digite "help" para ver os comandos disponíveis.',
      timestamp: new Date()
    }]);
  };

  const executeCommand = async (cmd: string) => {
    if (containerStatus !== 'running') return;

    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setIsLoading(true);
    
    // Simulate command execution delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    let output = '';
    let isError = false;

    if (trimmedCmd === 'clear') {
      setHistory([]);
      setIsLoading(false);
      setCommand('');
      return;
    }

    if (mockResponses[trimmedCmd]) {
      output = mockResponses[trimmedCmd];
    } else if (trimmedCmd.startsWith('kubectl')) {
      output = `Error: comando não reconhecido ou não implementado no ambiente de demonstração.\nTente um dos comandos sugeridos ou digite "help" para ver a lista completa.`;
      isError = true;
    } else {
      output = `bash: ${trimmedCmd}: command not found\n💡 Este terminal simula comandos kubectl. Digite "help" para ver os comandos disponíveis.`;
      isError = true;
    }

    const newEntry: TerminalOutput = {
      command: trimmedCmd,
      output,
      timestamp: new Date(),
      isError
    };

    setHistory(prev => [...prev, newEntry]);
    setCommand('');
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(command);
  };

  const resetContainer = () => {
    setContainerStatus('stopped');
    setHistory([]);
    setCommand('');
  };

  return (
    <div className="space-y-4">
      {/* Container Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <Server className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">
            Container Status: 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              containerStatus === 'running' ? 'bg-green-100 text-green-700' :
              containerStatus === 'starting' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {containerStatus === 'running' ? '🟢 Running' :
               containerStatus === 'starting' ? '🟡 Starting...' :
               '🔴 Stopped'}
            </span>
          </span>
        </div>
        <div className="flex gap-2">
          {containerStatus === 'stopped' && (
            <Button 
              onClick={startContainer} 
              disabled={isLoading}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-1" />
              Iniciar Container
            </Button>
          )}
          {containerStatus === 'running' && (
            <Button 
              onClick={resetContainer}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reiniciar
            </Button>
          )}
        </div>
      </div>

      {/* Terminal */}
      <Card className="terminal min-h-96 max-h-96 overflow-hidden">
        <div 
          ref={terminalRef}
          className="h-full p-4 overflow-y-auto font-mono text-sm"
        >
          {containerStatus === 'running' && (
            <>
              {history.map((entry, index) => (
                <div key={index} className="mb-2">
                  {entry.command !== 'system' && (
                    <div className="flex">
                      <span className="text-blue-400">ubuntu@k8s-learning:~$</span>
                      <span className="ml-2 text-white">{entry.command}</span>
                    </div>
                  )}
                  <div className={`whitespace-pre-wrap ${entry.isError ? 'text-red-400' : 'text-green-400'} mb-2`}>
                    {entry.output}
                  </div>
                </div>
              ))}
              
              {/* Command Input */}
              <form onSubmit={handleSubmit} className="flex items-center">
                <span className="text-blue-400 mr-2">ubuntu@k8s-learning:~$</span>
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder={isLoading ? "Executando..." : "Digite um comando kubectl..."}
                  disabled={isLoading}
                  className="bg-transparent border-none text-green-400 placeholder-gray-500 focus:ring-0 focus:outline-none flex-1"
                  style={{ boxShadow: 'none' }}
                />
                {isLoading && <span className="terminal-cursor ml-1">█</span>}
              </form>
            </>
          )}
          
          {containerStatus === 'stopped' && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Container parado</p>
                <p className="text-sm">Clique em "Iniciar Container" para começar</p>
              </div>
            </div>
          )}
          
          {containerStatus === 'starting' && (
            <div className="flex items-center justify-center h-full text-yellow-400">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Iniciando container Ubuntu com kubectl...</p>
                <p className="text-sm">Aguarde alguns segundos...</p>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {containerStatus === 'running' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 <strong>Dica:</strong> Este é um terminal simulado para aprendizado. 
          Digite "help" para ver todos os comandos disponíveis ou experimente os comandos das lições acima.
        </div>
      )}
    </div>
  );
};
