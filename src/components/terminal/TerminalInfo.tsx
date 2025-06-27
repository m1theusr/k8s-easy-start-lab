
import React from 'react';

export const TerminalInfo: React.FC = () => {
  return (
    <div className="text-xs text-muted-foreground bg-muted dark:bg-gray-800 p-2 rounded">
      💡 <strong>Terminal Real Docker:</strong> Este terminal está conectado a um container Ubuntu real com kubectl e minikube instalados.
      Para iniciar o Kubernetes: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">minikube start --driver=docker --force</code>
    </div>
  );
};
