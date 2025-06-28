# Backend Docker Terminal

## Como rodar

1. Certifique-se de que o Docker está rodando e existe uma imagem chamada `ubuntu-k8s` (ou ajuste o nome no código).
2. Instale as dependências:
   ```bash
   cd backend
   npm install
   ```
3. Inicie o servidor backend:
   ```bash
   npm start
   ```
4. O frontend se conecta automaticamente em `ws://localhost:3001`.

## Exemplo de Dockerfile para imagem customizada

```Dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y curl apt-transport-https
RUN apt-get install -y sudo vim git
# Instalar kubectl
RUN curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl
# Instalar minikube
RUN curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 \
    && install minikube-linux-amd64 /usr/local/bin/minikube \
    && rm minikube-linux-amd64
CMD ["bash"]
```

---

- O backend faz streaming dos logs de instalação e depois conecta o shell interativo ao terminal do frontend.
- O frontend deve usar socket.io-client para consumir os eventos.
