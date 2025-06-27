
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Server, Square } from 'lucide-react';

type ContainerStatus = 'stopped' | 'starting' | 'running' | 'stopping';

interface ContainerStatusProps {
  containerStatus: ContainerStatus;
  onStartContainer: () => void;
  onStopContainer: () => void;
}

export const ContainerStatus: React.FC<ContainerStatusProps> = ({
  containerStatus,
  onStartContainer,
  onStopContainer
}) => {
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
            onClick={onStartContainer}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-1" />
            Iniciar Container
          </Button>
        )}
        {containerStatus === 'running' && (
          <Button 
            onClick={onStopContainer}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Square className="w-4 h-4 mr-1" />
            Parar Container
          </Button>
        )}
      </div>
    </div>
  );
};
