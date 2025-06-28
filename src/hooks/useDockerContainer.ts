import { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { io, Socket } from 'socket.io-client';

export type ContainerStatusType = {
  status: 'none' | 'starting' | 'installing' | 'ready' | 'running' | 'stopping' | 'stopped' | 'error';
  error?: string;
};

export function useDockerContainer(terminal: Terminal | null) {
  const socketRef = useRef<Socket | null>(null);
  const [containerStatus, setContainerStatus] = useState<ContainerStatusType>({ status: 'none' });
  const [isShellReady, setIsShellReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Socket.io setup - configuração inicial
  useEffect(() => {
    if (!socketRef.current) {
      // Gera ou recupera um ID persistente para o usuário
      let persistentId = localStorage.getItem('k8s_lab_user_id');
      if (!persistentId) {
        persistentId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('k8s_lab_user_id', persistentId);
      }

      console.log('[FRONTEND] ID persistente:', persistentId);
      
      // Conecta com ID persistente
      const socket = io('http://localhost:3001', {
        query: { persistentId }
      });
      socketRef.current = socket;

      // Eventos básicos de conexão
      socket.on('connect', () => {
        console.log('[FRONTEND] Socket conectado com ID persistente:', persistentId);
        // Verifica se já existe um container para este usuário
        socket.emit('check-container');
      });

      socket.on('disconnect', () => {
        setContainerStatus({ status: 'none' });
        setIsShellReady(false);
      });

      // Status e logs do container
      socket.on('container-status', (status: string) => {
        console.log('[FRONTEND] Status atualizado:', status);
        setContainerStatus({ status: status as any });
      });

      socket.on('container-error', (err: string) => {
        console.log('[FRONTEND] Erro:', err);
        setContainerStatus({ status: 'error', error: err });
      });

      socket.on('container-logs', (log: string) => {
        setLogs((prevLogs) => [...prevLogs, log]);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Gerenciamento de shell ready e preparação do terminal
  useEffect(() => {
    if (!socketRef.current || !terminal) return;

    const handleShellReady = () => {
      console.log('[FRONTEND] Container pronto, atualizando status para running');
      // Explicitamente define o status como running quando recebe container-ready
      setContainerStatus({ status: 'running' });
      setIsShellReady(true);
      
      // Limpa e prepara o terminal
      terminal.clear();
      terminal.writeln('🟢 Shell Docker pronto! Digite comandos abaixo.');
      
      // Força foco e ajusta tamanho com um pequeno delay
      setTimeout(() => {
        terminal.focus();
        // Usa fitAddon se disponível
        if ((terminal as any).fitAddon) {
          (terminal as any).fitAddon.fit();
        }
        terminal.scrollToBottom();
      }, 100);
    };

    socketRef.current.on('container-ready', handleShellReady);

    return () => {
      socketRef.current?.off('container-ready', handleShellReady);
    };
  }, [terminal]);

  // Gerenciamento de output do container -> terminal
  useEffect(() => {
    if (!socketRef.current || !terminal) return;

    const handleShellOutput = (data: string) => {
      // Use setTimeout para garantir renderização correta
      setTimeout(() => {
        terminal.write(data);
        setTimeout(() => terminal.scrollToBottom(), 10);
      }, 0);
    };

    socketRef.current.on('container-output', handleShellOutput);

    return () => {
      socketRef.current?.off('container-output', handleShellOutput);
    };
  }, [terminal]);

  // Gerenciamento de input do terminal -> container
  useEffect(() => {
    if (!terminal) return;

    const handleTerminalInput = (data: string) => {
      if (isShellReady && socketRef.current) {
        // Quando shell está pronto, apenas envia ao backend sem eco local
        // pois o servidor já fará o eco de volta
        socketRef.current.emit('terminal-input', data);
      } else {
        // Echo local APENAS quando shell não está pronto
        if (data.trim() === 'clear') {
          terminal.clear();
        } else {
          terminal.write(data); // Echo local
        }
      }
    };

    // Registre o handler apenas uma vez e armazene o disposable para limpeza
    const disposable = terminal.onData(handleTerminalInput);
    
    return () => {
      // Limpe o listener usando o objeto disposable
      if (disposable && typeof disposable.dispose === 'function') {
        disposable.dispose();
      }
    };
  }, [terminal, isShellReady]);

  // Ações do usuário
  const createContainer = useCallback(() => {
    setContainerStatus({ status: 'starting' });
    setIsShellReady(false);
    terminal?.clear();
    terminal?.writeln('⏳ Inicializando container Docker Ubuntu + Kubernetes...');
    socketRef.current?.emit('create-container');
  }, [terminal]);

  // Função para parar container
  const stopContainer = useCallback(() => {
    setContainerStatus({ status: 'stopped' });
    setIsShellReady(false);
    socketRef.current?.emit('stop-container');
    terminal?.writeln('🛑 Container parado.');
  }, [terminal]);

  return {
    containerStatus,
    createContainer,
    stopContainer,
    isShellReady,
  };
};
