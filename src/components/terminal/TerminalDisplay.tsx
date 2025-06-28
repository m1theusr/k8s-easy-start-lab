
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface TerminalDisplayProps {
  terminalRef: React.RefObject<HTMLDivElement>;
  isTerminalReady: boolean;
}

export const TerminalDisplay: React.FC<TerminalDisplayProps> = ({ terminalRef, isTerminalReady }) => {
  
  return (
    <Card className="bg-black border-gray-700">
      {/* Mostrar loader enquanto o terminal não estiver pronto */}
      {!isTerminalReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/70">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-primary">Inicializando terminal...</p>
          </div>
        </div>
      )}
      
      {/* Container do terminal sempre visível */}
      <div 
        ref={terminalRef}
        className="w-full h-96 rounded-b-md bg-black relative"
        style={{ minHeight: '400px', padding: 0, overflow: 'hidden' }}
        id="terminal-container"
      />
    </Card>
  );
};
