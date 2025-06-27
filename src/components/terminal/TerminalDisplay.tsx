
import React from 'react';
import { Card } from '@/components/ui/card';

interface TerminalDisplayProps {
  terminalRef: React.RefObject<HTMLDivElement>;
}

export const TerminalDisplay: React.FC<TerminalDisplayProps> = ({ terminalRef }) => {
  return (
    <Card className="bg-black border-gray-700">
      <div 
        ref={terminalRef}
        className="w-full h-96 p-2 overflow-auto"
        style={{ minHeight: '400px' }}
      />
    </Card>
  );
};
