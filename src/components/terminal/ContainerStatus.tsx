import React, { useState, useEffect } from 'react';
import { Server, Play, Square } from 'lucide-react';
import { ContainerStatusType } from '@/hooks/useDockerContainer';

// Tempo de cooldown em milissegundos
const BUTTON_COOLDOWN = 3000; // 3 segundos

interface ContainerStatusProps {
  containerStatus: ContainerStatusType;
  onStartContainer: () => void;
  onStopContainer: () => void;
  isTerminalReady: boolean;
}

export const ContainerStatus: React.FC<ContainerStatusProps> = ({
  containerStatus,
  onStartContainer,
  onStopContainer,
  isTerminalReady
}) => {
  // Estado para controlar o cooldown dos botões
  const [buttonCooldown, setButtonCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  
  // Função para gerenciar o cooldown dos botões
  const handleWithCooldown = (action: () => void) => {
    if (buttonCooldown) return;
    
    // Executa a ação solicitada
    action();
    
    // Ativa o cooldown
    setButtonCooldown(true);
    setCooldownRemaining(BUTTON_COOLDOWN);
    
    // Inicia contador visual regressivo
    const interval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          setButtonCooldown(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  };
  
  // Limpar o intervalo quando o componente for desmontado
  useEffect(() => {
    return () => {
      setCooldownRemaining(0);
      setButtonCooldown(false);
    };
  }, []);
  const getStatusColor = () => {
    switch (containerStatus.status) {
      case 'running': return 'bg-green-600 dark:bg-green-700 text-white';
      case 'starting': return 'bg-yellow-600 dark:bg-yellow-700 text-white';
      case 'installing': return 'bg-blue-600 dark:bg-blue-700 text-white';
      case 'ready': return 'bg-green-600 dark:bg-green-700 text-white';
      case 'stopping': return 'bg-orange-600 dark:bg-orange-700 text-white';
      case 'error': return 'bg-red-600 dark:bg-red-700 text-white';
      default: return 'bg-gray-600 dark:bg-gray-700 text-white';
    }
  };

  const getStatusText = () => {
    switch (containerStatus.status) {
      case 'running': return '🟢 Rodando';
      case 'starting': return '🟡 Iniciando...';
      case 'installing': return '🟡 Configurando...';
      case 'ready': return '🟢 Pronto';
      case 'stopping': return '🟠 Parando...';
      case 'error': return '❌ Erro: ' + (containerStatus.error || 'Desconhecido');
      default: return '🔴 Parado';
    }
  };

  return (
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
        {/* Se estiver parado ou com erro, mostra botão Iniciar */}
        {(['none', 'stopped', 'error'].includes(containerStatus.status)) ? (
          <button 
            onClick={() => handleWithCooldown(onStartContainer)}
            className={`bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center
              ${!isTerminalReady || buttonCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isTerminalReady || buttonCooldown}
            title={!isTerminalReady ? 'Aguardando terminal...' : 
                  buttonCooldown ? `Aguarde ${Math.ceil(cooldownRemaining/1000)}s` : 'Iniciar container'}
          >
            <Play className="w-4 h-4 mr-1" />
            {buttonCooldown ? `Aguarde (${Math.ceil(cooldownRemaining/1000)}s)` : 'Iniciar'}
          </button>
        ) : (
          /* Se estiver rodando, iniciando ou em qualquer outro estado, mostra botão Parar */
          <button 
            onClick={() => handleWithCooldown(onStopContainer)}
            className={`bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center
              ${containerStatus.status === 'stopping' || buttonCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={containerStatus.status === 'stopping' || buttonCooldown}
            title={buttonCooldown ? `Aguarde ${Math.ceil(cooldownRemaining/1000)}s` : 'Parar container'}
          >
            <Square className="w-4 h-4 mr-1" />
            {buttonCooldown ? `Aguarde (${Math.ceil(cooldownRemaining/1000)}s)` : 'Parar'}
          </button>
        )}
      </div>
    </div>
  );
};
