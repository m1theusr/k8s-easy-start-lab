
import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';

// Importar os estilos CSS do xterm.js
import 'xterm/css/xterm.css';

// Evento personalizado para notificar que o terminal está pronto
export const TERMINAL_READY_EVENT = 'terminal-ready';

export const useTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [fitAddon, setFitAddon] = useState<FitAddon | null>(null);
  const [isTerminalReady, setIsTerminalReady] = useState<boolean>(false);

  useEffect(() => {
    if (!terminal && terminalRef.current) {
      const timeout = setTimeout(() => {
        if (!terminal && terminalRef.current) {
      
          // Configuração mais robusta do terminal
          const term = new Terminal({
            cursorBlink: true,
            fontFamily: "'JetBrains Mono', 'Fira Mono', 'Menlo', 'monospace'",
            fontSize: 15,
            fontWeight: 400,
            letterSpacing: 0.5,
            theme: {
              background: '#18181b',   // Fundo dark Shadcn
              foreground: '#e5e5e5',   // Texto suave
              cursor: '#7dd3fc',       // Azul claro
              black: '#18181b',
              red: '#fb7185',
              green: '#22d3ee',
              yellow: '#facc15',  
              blue: '#60a5fa',
              magenta: '#c084fc',
              cyan: '#67e8f9',
              white: '#e5e5e5',
              brightBlack: '#71717a',
              brightRed: '#fda4af',
              brightGreen: '#5eead4',
              brightYellow: '#fde68a',
              brightBlue: '#93c5fd',
              brightMagenta: '#e879f9',
              brightCyan: '#a7f3d0',
              brightWhite: '#f4f4f5'
            },
            convertEol: true,  // Converte \n em \r\n
            cols: 100,         // Largura explícita
            rows: 30,          // Altura explícita
            scrollback: 1000,  // Buffer de scrollback
            disableStdin: false // Habilitar entrada de teclado
          });

          // Adicionar o addon de ajuste
          const fit = new FitAddon();
          term.loadAddon(fit);
          
          try {
            // Abrir o terminal no elemento DOM
            term.open(terminalRef.current);
            
            // Ajustar tamanho
            fit.fit();
            term.clear();
            
            // Atualizar o estado
            setTerminal(term);
            setFitAddon(fit);
            
            // Marcar terminal como pronto e disparar evento personalizado
            setIsTerminalReady(true);
            window.dispatchEvent(new CustomEvent(TERMINAL_READY_EVENT));

          } catch (error) {
            console.error('❌ Erro ao inicializar terminal:', error);
          }

          // Corrigir eco local duplicado: só ecoar localmente se NÃO estiver pronto para shell remoto
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
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [terminal, terminalRef, isTerminalReady]);

  return { terminalRef, terminal, fitAddon, isTerminalReady };
};
