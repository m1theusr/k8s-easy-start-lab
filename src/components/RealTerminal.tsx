
import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, RotateCcw, Server, Square } from 'lucide-react';
import Docker from 'dockerode';

interface RealTerminalProps {}

export const RealTerminal: React.FC<RealTerminalProps> = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [fitAddon, setFitAddon] = useState<FitAddon | null>(null);
  const [containerStatus, setContainerStatus] = useState<'stopped' | 'starting' | 'running' | 'stopping'>('stopped');
  const [container, setContainer] = useState<any>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const docker = useRef(new Docker());

  useEffect(() => {
    if (terminalRef.current && !terminal) {
      const term = new Terminal({
        cursorBlink: true,
        theme: {
          background: '#000000',
          foreground: '#00ff00',
          cursor: '#00ff00',
          selection: '#ffffff20',
        },
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      });

      const fit = new FitAddon();
      term.loadAddon(fit);
      
      term.open(terminalRef.current);
      fit.fit();

      setTerminal(term);
      setFitAddon(fit);

      // Handle window resize
      const handleResize = () => {
        if (fit) fit.fit();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        term.dispose();
      };
    }
  }, [terminal]);

  const createContainer = async () => {
    try {
      setContainerStatus('starting');
      
      // Create container with Ubuntu + kubectl + minikube
      const containerConfig = {
        Image: 'ubuntu:22.04',
        Cmd: ['/bin/bash'],
        Tty: true,
        OpenStdin: true,
        WorkingDir: '/root',
        Env: [
          'DEBIAN_FRONTEND=noninteractive',
          'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
        ],
        ExposedPorts: {
          '8080/tcp': {},
          '30000/tcp': {}
        },
        HostConfig: {
          PortBindings: {
            '8080/tcp': [{ HostPort: '8080' }],
            '30000/tcp': [{ HostPort: '30000' }]
          },
          Privileged: true,
          AutoRemove: true
        }
      };

      const newContainer = await docker.current.createContainer(containerConfig);
      await newContainer.start();
      setContainer(newContainer);

      // Execute setup commands
      await setupKubernetes(newContainer);

      setContainerStatus('running');
      connectToContainer(newContainer);

    } catch (error) {
      console.error('Error creating container:', error);
      setContainerStatus('stopped');
      if (terminal) {
        terminal.writeln('\r\n❌ Erro ao criar container Docker');
        terminal.writeln('Verifique se o Docker está rodando e acessível');
      }
    }
  };

  const setupKubernetes = async (container: any) => {
    const setupCommands = [
      'apt-get update',
      'apt-get install -y curl wget apt-transport-https ca-certificates gnupg lsb-release',
      'curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"',
      'chmod +x kubectl && mv kubectl /usr/local/bin/',
      'curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64',
      'chmod +x minikube && mv minikube /usr/local/bin/',
      'apt-get install -y docker.io',
      'echo "Setup completed! Use: minikube start --driver=docker --force" > /root/setup-complete.txt'
    ];

    for (const cmd of setupCommands) {
      const exec = await container.exec({
        Cmd: ['bash', '-c', cmd],
        AttachStdout: true,
        AttachStderr: true
      });
      await exec.start({});
    }
  };

  const connectToContainer = async (container: any) => {
    try {
      // Create exec instance for interactive bash
      const exec = await container.exec({
        Cmd: ['bash'],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true
      });

      const stream = await exec.start({
        hijack: true,
        stdin: true
      });

      if (terminal) {
        terminal.writeln('🐳 Conectado ao container Ubuntu com Kubernetes!');
        terminal.writeln('📋 Setup concluído! Digite os comandos:');
        terminal.writeln('   minikube start --driver=docker --force');
        terminal.writeln('   kubectl version');
        terminal.writeln('');

        // Handle terminal input
        terminal.onData((data) => {
          stream.write(data);
        });

        // Handle container output
        stream.on('data', (data: Buffer) => {
          const text = data.toString();
          terminal.write(text);
        });

        stream.on('end', () => {
          terminal.writeln('\r\n🔌 Conexão com container encerrada');
          setContainerStatus('stopped');
        });
      }

    } catch (error) {
      console.error('Error connecting to container:', error);
      if (terminal) {
        terminal.writeln('\r\n❌ Erro ao conectar com container');
      }
    }
  };

  const stopContainer = async () => {
    if (container) {
      try {
        setContainerStatus('stopping');
        await container.stop();
        setContainer(null);
        setContainerStatus('stopped');
        if (terminal) {
          terminal.writeln('\r\n🛑 Container parado');
        }
      } catch (error) {
        console.error('Error stopping container:', error);
      }
    }
  };

  const getStatusColor = () => {
    switch (containerStatus) {
      case 'running': return 'bg-green-600 dark:bg-green-700 text-white';
      case 'starting': return 'bg-yellow-600 dark:bg-yellow-700 text-white';
      case 'stopping': return 'bg-orange-600 dark:bg-orange-700 text-white';
      default: return 'bg-gray-600 dark:bg-gray-700 text-white';
    }
  };

  const getStatusText = () => {
    switch (containerStatus) {
      case 'running': return '🟢 Rodando';
      case 'starting': return '🟡 Iniciando...';
      case 'stopping': return '🟠 Parando...';
      default: return '🔴 Parado';
    }
  };

  return (
    <div className="space-y-4">
      {/* Container Status */}
      <div className="flex items-center justify-between p-3 bg-muted dark:bg-gray-800 rounded-lg">
        <div className="flex items-center">
          <Server className="w-5 h-5 mr-2 text-foreground" />
          <span className="text-sm font-medium text-foreground">
            Docker Container: 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </span>
        </div>
        <div className="flex gap-2">
          {containerStatus === 'stopped' && (
            <Button 
              onClick={createContainer}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-1" />
              Iniciar Container
            </Button>
          )}
          {containerStatus === 'running' && (
            <Button 
              onClick={stopContainer}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="w-4 h-4 mr-1" />
              Parar Container
            </Button>
          )}
        </div>
      </div>

      {/* Terminal */}
      <Card className="bg-black border-gray-700 min-h-96">
        <div 
          ref={terminalRef}
          className="w-full h-96 p-2"
          style={{ minHeight: '400px' }}
        />
      </Card>
      
      <div className="text-xs text-muted-foreground bg-muted dark:bg-gray-800 p-2 rounded">
        💡 <strong>Terminal Real Docker:</strong> Este terminal está conectado a um container Ubuntu real com kubectl e minikube instalados.
        Para iniciar o Kubernetes: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">minikube start --driver=docker --force</code>
      </div>
    </div>
  );
};
