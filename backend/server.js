// Backend Node.js + socket.io + dockerode para terminal Docker interativo
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { spawn } = require('child_process');

// Configuração do Servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const docker = new Docker();

// Mapa para armazenar containers de cada usuário
const userContainers = new Map();

// Rota para healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    containerCount: userContainers.size
  });
});

// Configurações do container
const CONTAINER_CONFIG = {
  image: 'ubuntu-k8s', // Nome da imagem Docker
  resourceLimits: {
    memory: '256m',
    cpus: '0.5'
  },
  timeout: 3600000, // 1 hora (60 minutos) de inatividade antes de limpar automaticamente
  sessionExpiry: 3600000 // 60 minutos para expiração da sessão
};

// Utilitário para garantir que a imagem existe ou criar se necessário
async function ensureDockerImage(imageName) {
  const images = await docker.listImages();
  const exists = images.some(img => (img.RepoTags || []).includes(imageName + ':latest'));
  if (exists) {
    console.log(`[DOCKER] Imagem '${imageName}' já existe.`);
    return true;
  }
  // Buildar imagem se não existir
  console.log(`[DOCKER] Imagem '${imageName}' não encontrada. Buildando a partir de backend/dockerfile...`);
  await new Promise((resolve, reject) => {
    const dockerfilePath = path.join(__dirname, 'dockerfile');
    const build = spawn('docker', ['build', '-t', imageName, '-f', dockerfilePath, '.'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    build.on('close', (code) => {
      if (code === 0) {
        console.log(`[DOCKER] Build da imagem '${imageName}' concluído.`);
        resolve();
      } else {
        reject(new Error(`[DOCKER] Falha ao buildar a imagem '${imageName}'. Código: ${code}`));
      }
    });
  });
  return true;
}

// Verificação periódica de containers inativos
setInterval(async () => {
  console.log(`[MAINTENANCE] Verificando containers inativos (total: ${userContainers.size})`);
  const now = Date.now();
  
  // Checa cada container
  for (const [userId, userData] of userContainers.entries()) {
    const inactiveTime = now - userData.lastActivity;
    const sessionAge = now - (userData.createdAt || now);
    
    // Se a sessão está mais velha que sessionExpiry (60 min), limpa independente da atividade
    if (sessionAge > CONTAINER_CONFIG.sessionExpiry) {
      console.log(`[MAINTENANCE] Sessão do usuário ${userId.slice(0, 8)} expirou após ${Math.floor(sessionAge/60000)} minutos, removendo...`);
      await cleanupUserResources(userId);
      userContainers.delete(userId);
    }
    // Se está inativo por mais tempo que o timeout, limpa
    else if (inactiveTime > CONTAINER_CONFIG.timeout) {
      console.log(`[MAINTENANCE] Container do usuário ${userId.slice(0, 8)} inativo por ${Math.floor(inactiveTime/60000)} minutos, removendo...`);
      await cleanupUserResources(userId);
      userContainers.delete(userId);
    }
  }
}, 60000); // Verifica a cada 1 minuto

// Função para encerrar e remover todos os containers gerenciados pelo backend
async function cleanupAllContainers() {
  console.log('[SHUTDOWN] Encerrando todos os containers gerenciados pelo backend...');
  for (const [userId, userData] of userContainers.entries()) {
    try {
      await cleanupUserResources(userId);
      userContainers.delete(userId);
      console.log(`[SHUTDOWN] Container do usuário ${userId.slice(0, 8)} removido.`);
    } catch (err) {
      console.error(`[SHUTDOWN] Falha ao remover container do usuário ${userId}:`, err.message);
    }
  }
}

// Handler para SIGINT/SIGTERM
const shutdownSignals = ['SIGINT', 'SIGTERM'];
shutdownSignals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n[SHUTDOWN] Sinal ${signal} recebido. Limpando containers...`);
    await cleanupAllContainers();
    console.log('[SHUTDOWN] Todos os containers encerrados. Encerrando backend.');
    process.exit(0);
  });
});

// Função para limpar recursos de um usuário
async function cleanupUserResources(userId) {
  try {
    const userData = userContainers.get(userId);
    if (!userData) return;
    
    console.log(`[MAINTENANCE] Limpando recursos do usuário ${userId.slice(0, 8)}...`);
    
    // Fecha streams se existirem
    if (userData.logStream) {
      try { userData.logStream.destroy(); } catch (e) {}
      userData.logStream = null;
    }
    
    if (userData.execStream) {
      try { userData.execStream.destroy(); } catch (e) {}
      userData.execStream = null;
    }
    // Parar e remover o container
    if (userData.container) {
      try {
        await userData.container.stop();
      } catch {}
      try {
        await userData.container.remove({ force: true });
      } catch {}
    }
    
    console.log(`[CLEANUP] Recursos do usuário ${userId} removidos com sucesso`);
  } catch (err) {
    console.error(`[ERROR] Erro ao limpar recursos do usuário ${userId}:`, err.message);
    throw err;
  }
}

// Gerenciamento de conexões Socket.io
io.on('connection', (socket) => {
  // Usa o ID persistente do cliente ou cria um novo se não existir
  const persistentId = socket.handshake.query.persistentId || `user_${socket.id}`;
  const socketId = socket.id;
  
  console.log(`[SOCKET.IO] Novo cliente conectado: ${socketId} (ID persistente: ${persistentId})`);
  
  // Verifica se já existe um container para este ID persistente
  if (!userContainers.has(persistentId)) {
    // Inicializa dados do usuário no mapa se for primeira conexão
    userContainers.set(persistentId, { 
      lastActivity: Date.now(),
      container: null,
      exec: null, 
      execStream: null, 
      logStream: null,
      socketId: socketId,  // Armazena o socket atual
      createdAt: Date.now(), // Quando esta sessão foi criada
      reconnections: 0 // Contagem de reconexões
    });
  } else {
    // Atualiza o socketId para o novo socket e incrementa contador de reconexões
    const userData = userContainers.get(persistentId);
    userData.socketId = socketId;
    userData.lastActivity = Date.now();
    userData.reconnections += 1;
    console.log(`[SOCKET.IO] Reconexão #${userData.reconnections} para ID persistente: ${persistentId}`);
  }

  // Atualiza timestamp de atividade sempre que o usuário interagir
  function updateActivity() {
    if (userContainers.has(persistentId)) {
      userContainers.get(persistentId).lastActivity = Date.now();
    }
  }

  // Handler para verificar se já existe um container para o usuário
  socket.on('check-container', async () => {
    updateActivity();
    const userData = userContainers.get(persistentId);
    
    // Verifica se o container existe e ainda está válido
    if (userData.container) {
      try {
        // Verifica se o container ainda está ativo
        const containerInfo = await userData.container.inspect();
        const isRunning = containerInfo.State.Running;
        
        // Verifica se não expirou (60 minutos)
        const sessionAge = Date.now() - userData.createdAt;
        const isExpired = sessionAge > CONTAINER_CONFIG.sessionExpiry;
        
        if (isRunning && !isExpired) {
          console.log(`[SOCKET.IO] Container existente encontrado para ${persistentId}, reconectando...`);
          
          // Reconecta ao container existente
          socket.emit('container-status', 'starting');
          socket.emit('container-status', 'installing');
          
          // Configura novo shell no container existente
          try {
            setTimeout(async () => {
              const exec = await userData.container.exec({
                Cmd: ['/bin/bash'],
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
              });
              
              userData.exec = exec;
              const execStream = await exec.start({ hijack: true, stdin: true });
              userData.execStream = execStream;
              
              execStream.on('data', (chunk) => {
                socket.emit('container-output', chunk.toString());
              });
              
              socket.on('terminal-input', (data) => {
                updateActivity();
                execStream.write(data);
              });
              
              socket.emit('container-status', 'ready');
              socket.emit('container-ready');
              console.log(`[DOCKER] Reconectado ao container para usuário ${persistentId}`);
            }, 1000);
          } catch (err) {
            console.error(`[ERROR] Falha ao reconectar ao shell para ${persistentId}:`, err.message);
            socket.emit('container-status', 'error');
            socket.emit('container-output', '\u001b[31mErro ao reconectar ao shell: ' + err.message + '\u001b[0m\n');
          }
          return;
        } else {
          // Container existe mas expirou ou está parado
          console.log(`[SOCKET.IO] Container para ${persistentId} expirou ou está parado, removendo...`);
          await cleanupUserResources(persistentId);
        }
      } catch (err) {
        // Container provavelmente não existe mais
        console.log(`[SOCKET.IO] Container para ${persistentId} não está mais disponível:`, err.message);
        userData.container = null;
      }
    } else {
      console.log(`[SOCKET.IO] Nenhum container existente para ${persistentId}`);
      socket.emit('container-status', 'none');
    }
  });

  // Handler para criação de container
  socket.on('create-container', async () => {
    updateActivity();
    console.log(`[SOCKET.IO] Evento create-container recebido de ${socketId} (ID persistente: ${persistentId})`);
    
    // Limpa container anterior se existir
    if (userContainers.get(persistentId).container) {
      await cleanupUserResources(persistentId);
      const userData = userContainers.get(persistentId);
      userData.container = null;
      userData.exec = null;
      userData.execStream = null;
      userData.logStream = null;
      userData.lastActivity = Date.now();
    }
    
    const image = CONTAINER_CONFIG.image;
    socket.emit('container-status', 'starting');
    
    // Verifica se a imagem existe
    const hasImage = await ensureDockerImage(image);
    console.log(`[DOCKER] Verificando imagem '${image}':`, hasImage ? 'ENCONTRADA' : 'NÃO ENCONTRADA');
    
    if (!hasImage) {
      socket.emit('container-status', 'error');
      socket.emit('container-output', '\u001b[31mImagem Docker não encontrada: ' + image + '\u001b[0m\n');
      return;
    }
    
    try {
      console.log(`[DOCKER] Criando container para usuário ${persistentId}...`);
      
      // Cria container com limites de recursos e nome único
      const container = await docker.createContainer({
        Image: image,
        Tty: true,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: true,
        StdinOnce: false,
        name: `k8s-lab-${persistentId.slice(0, 8)}-${uuidv4().slice(0, 8)}`,
        HostConfig: {
          Memory: 268435456, // 256MB em bytes
          NanoCpus: 500000000, // 0.5 CPUs
          AutoRemove: false // Mudado para false para permitir reconexão
        }
      });
      
      await container.start();
      console.log(`[DOCKER] Container iniciado para usuário ${persistentId}!`);
      
      // Atualiza dados do usuário
      const userData = userContainers.get(persistentId);
      userData.container = container;
      userData.createdAt = Date.now(); // Atualiza timestamp de criação de sessão
      
      socket.emit('container-status', 'installing');
      
      // Stream de logs
      const logStream = await container.attach({ stream: true, stdout: true, stderr: true });
      userData.logStream = logStream;
      
      logStream.on('data', (chunk) => {
        socket.emit('container-output', chunk.toString());
        // Logs de saída do container removidos para reduzir ruído no console
      });
      
      // Simula instalação e configura shell
      setTimeout(async () => {
        try {
          socket.emit('container-status', 'ready');
          socket.emit('container-ready');
          
          console.log(`[DOCKER] Iniciando shell interativo para ${persistentId}...`);
          
          const exec = await container.exec({
            Cmd: ['/bin/bash'],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
          });
          
          userData.exec = exec;
          
          const execStream = await exec.start({ hijack: true, stdin: true });
          userData.execStream = execStream;
          
          execStream.on('data', (chunk) => {
            socket.emit('container-output', chunk.toString());
            // Logs de saída também foram removidos para reduzir ruído no console
          });
          
          // Atualiza atividade quando recebe comando
          socket.on('terminal-input', (data) => {
            updateActivity();
            execStream.write(data);
            // Removidos logs de entrada de terminal por serem muito verbosos
          });
          
          console.log(`[DOCKER] Shell pronto para usuário ${persistentId}`);
        } catch (err) {
          console.error(`[ERROR] Falha ao iniciar shell para ${persistentId}:`, err.message);
          socket.emit('container-status', 'error');
          socket.emit('container-output', '\u001b[31mErro ao iniciar shell: ' + err.message + '\u001b[0m\n');
        }
      }, 2000);
      
    } catch (err) {
      console.error(`[ERROR] Falha ao criar container para ${persistentId}:`, err.message);
      socket.emit('container-status', 'error');
      socket.emit('container-output', '\u001b[31mErro ao criar container: ' + err.message + '\u001b[0m\n');
    }
  });

  // Handler para parar o container
  socket.on('stop-container', async () => {
    updateActivity();
    try {
      // Tenta parar o container diretamente (mais confiável que remove)
      const userData = userContainers.get(persistentId);
      if (!userData || !userData.container) {
        socket.emit('container-status', 'none');
        return;
      }
      
      socket.emit('container-status', 'stopping');
      await cleanupUserResources(persistentId);
      socket.emit('container-status', 'stopped');
      console.log(`[DOCKER] Container parado pelo usuário ${persistentId}`);
    } catch (err) {
      console.error(`[ERROR] Falha ao parar container do usuário ${persistentId}:`, err.message);
    }
  });

  // Limpa recursos quando usuário desconecta
  socket.on('disconnect', async () => {
    console.log(`[SOCKET.IO] Cliente desconectado: ${socketId} (ID persistente: ${persistentId})`);
    if (userContainers.has(persistentId)) {
      userContainers.get(persistentId).lastActivity = Date.now();
      console.log(`[INFO] Container do usuário ${persistentId} ficará disponível por 60 minutos`);
    }
  });
});

// Antes de iniciar o servidor, garanta que a imagem Docker existe
(async () => {
  try {
    await ensureDockerImage('ubuntu-k8s');
    server.listen(3001, () => {
      console.log('Backend socket ouvindo em porta :3001');
    });
  } catch (err) {
    console.error('[DOCKER] Erro ao garantir imagem ubuntu-k8s:', err);
    process.exit(1);
  }
})();
