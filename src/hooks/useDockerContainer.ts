
import { useRef, useState } from 'react';
import Docker from 'dockerode';
import { Terminal } from 'xterm';

type ContainerStatus = 'stopped' | 'starting' | 'running' | 'stopping';

export const useDockerContainer = (terminal: Terminal | null) => {
  const [containerStatus, setContainerStatus] = useState<ContainerStatus>('stopped');
  const [container, setContainer] = useState<any>(null);
  const docker = useRef(new Docker());

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

  return {
    containerStatus,
    createContainer,
    stopContainer
  };
};
