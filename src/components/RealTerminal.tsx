import React, { useEffect, useState } from 'react';
import { useTerminal } from '@/hooks/useTerminal';
import { useDockerContainer } from '@/hooks/useDockerContainer';
import { ContainerStatus } from './terminal/ContainerStatus';
import { TerminalDisplay } from './terminal/TerminalDisplay';
import { TerminalInfo } from './terminal/TerminalInfo';

export function RealTerminal() {
  const [autoStart, setAutoStart] = useState(false);

  // Inicializar terminal primeiro
  const { terminalRef, terminal, isTerminalReady } = useTerminal();
  
  // Passar terminal para o hook Docker
  const { containerStatus, createContainer, stopContainer } = useDockerContainer(terminal);
  
  // Log para debug - quando o terminal é inicializado
  useEffect(() => {
    console.log('[RealTerminal] Terminal inicializado:', terminal ? 'sim' : 'não');
    console.log('[RealTerminal] Status do container:', containerStatus);
    // Removido auto-start: agora só inicia ao clicar no botão
  }, [terminal, containerStatus]);
  
  // Handlers para garantir que os eventos são propagados corretamente
  const handleStartContainer = () => {
    if (!isTerminalReady) {
      console.log('[RealTerminal] Terminal ainda não está pronto, aguardando...');
      return;
    }
    console.log('[RealTerminal] Botão Iniciar Container clicado');
    createContainer();
  };
  
  const handleStopContainer = () => {
    console.log('[RealTerminal] Botão Parar Container clicado');
    stopContainer();
  };

  return (
    <div className="space-y-4">
      <ContainerStatus 
        containerStatus={containerStatus}
        onStartContainer={handleStartContainer}
        onStopContainer={handleStopContainer}
        isTerminalReady={isTerminalReady}
      />

      <TerminalDisplay terminalRef={terminalRef} isTerminalReady={isTerminalReady} />
      
      <TerminalInfo />
    </div>
  );
}
