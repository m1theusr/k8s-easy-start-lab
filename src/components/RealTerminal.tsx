
import React from 'react';
import { useTerminal } from '@/hooks/useTerminal';
import { useDockerContainer } from '@/hooks/useDockerContainer';
import { ContainerStatus } from './terminal/ContainerStatus';
import { TerminalDisplay } from './terminal/TerminalDisplay';
import { TerminalInfo } from './terminal/TerminalInfo';

interface RealTerminalProps {}

export const RealTerminal: React.FC<RealTerminalProps> = () => {
  const { terminalRef, terminal } = useTerminal();
  const { containerStatus, createContainer, stopContainer } = useDockerContainer(terminal);

  return (
    <div className="space-y-4">
      <ContainerStatus 
        containerStatus={containerStatus}
        onStartContainer={createContainer}
        onStopContainer={stopContainer}
      />
      
      <TerminalDisplay terminalRef={terminalRef} />
      
      <TerminalInfo />
    </div>
  );
};
