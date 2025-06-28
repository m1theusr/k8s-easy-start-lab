
export interface LessonStep {
  id: number;
  title: string;
  description: string;
  commands: string[];
  explanation: string;
  completed: boolean;
}

export interface KubernetesModule {
  id: number;
  title: string;
  description: string;
  icon: string;
  lessons: LessonStep[];
}

export const kubernetesModules: KubernetesModule[] = [
  {
    id: 1,
    title: "Fundamentos do Kubernetes",
    description: "Aprenda os conceitos básicos e componentes essenciais do Kubernetes",
    icon: "BookOpen",
    lessons: [
      {
        id: 1,
        title: "Verificando Instalação do kubectl",
        description: "Primeiro, vamos verificar se o kubectl está instalado e funcionando",
        commands: ["kubectl version --client", "kubectl cluster-info"],
        explanation: "O kubectl é a ferramenta de linha de comando para interagir com clusters Kubernetes. Estes comandos verificam a versão e informações do cluster.",
        completed: false
      },
      {
        id: 2,
        title: "Explorando a Arquitetura do Cluster",
        description: "Vamos entender a estrutura básica de um cluster Kubernetes",
        commands: ["kubectl get nodes", "kubectl describe nodes", "kubectl get namespaces"],
        explanation: "Nodes são as máquinas onde os pods executam. Namespaces organizam recursos do cluster. Estes comandos mostram a estrutura básica do cluster.",
        completed: false
      },
      {
        id: 3,
        title: "Iniciando o Minikube",
        description: "Configure e inicie seu ambiente de desenvolvimento local",
        commands: ["minikube start", "minikube status", "kubectl config current-context"],
        explanation: "Minikube cria um cluster Kubernetes local para desenvolvimento. É essencial verificar se está rodando corretamente.",
        completed: false
      },
      {
        id: 4,
        title: "Explorando Recursos do Cluster",
        description: "Descubra os tipos de recursos disponíveis no Kubernetes",
        commands: ["kubectl api-resources", "kubectl get all", "kubectl get all --all-namespaces"],
        explanation: "O Kubernetes tem muitos tipos de recursos. Estes comandos mostram todos os recursos disponíveis e seus estados atuais.",
        completed: false
      },
      {
        id: 5,
        title: "Entendendo Contextos e Configurações",
        description: "Aprenda a gerenciar diferentes ambientes e configurações",
        commands: ["kubectl config view", "kubectl config get-contexts", "kubectl cluster-info dump"],
        explanation: "Contextos permitem alternar entre diferentes clusters. A configuração do kubectl define como se conectar aos clusters.",
        completed: false
      }
    ]
  },
  {
    id: 2,
    title: "Pods e Containers",
    description: "Domine a criação e gerenciamento de Pods, a menor unidade do Kubernetes",
    icon: "Box",
    lessons: [
      {
        id: 6,
        title: "Criando seu Primeiro Pod",
        description: "Vamos criar um pod simples com nginx",
        commands: [
          "kubectl run nginx-pod --image=nginx:latest",
          "kubectl get pods",
          "kubectl describe pod nginx-pod"
        ],
        explanation: "Um Pod é a menor unidade executável no Kubernetes. Aqui criamos um pod com nginx e verificamos seu status.",
        completed: false
      },
      {
        id: 7,
        title: "Gerenciando Ciclo de Vida dos Pods",
        description: "Aprenda a monitorar e gerenciar pods em execução",
        commands: [
          "kubectl get pods -o wide",
          "kubectl logs nginx-pod",
          "kubectl exec -it nginx-pod -- /bin/bash"
        ],
        explanation: "Monitorar logs e acessar pods em execução são tarefas essenciais. O comando exec permite executar comandos dentro do container.",
        completed: false
      },
      {
        id: 8,
        title: "Pods com Múltiplos Containers",
        description: "Crie pods com containers que trabalham juntos",
        commands: [
          "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: multi-container\nspec:\n  containers:\n  - name: nginx\n    image: nginx\n  - name: busybox\n    image: busybox\n    command: ['sleep', '3600']\nEOF",
          "kubectl get pod multi-container",
          "kubectl logs multi-container -c nginx"
        ],
        explanation: "Pods podem conter múltiplos containers que compartilham rede e volumes. Isso é útil para padrões como sidecar.",
        completed: false
      },
      {
        id: 9,
        title: "Configurando Recursos de Pods",
        description: "Define limites de CPU e memória para containers",
        commands: [
          "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: resource-pod\nspec:\n  containers:\n  - name: nginx\n    image: nginx\n    resources:\n      requests:\n        memory: '64Mi'\n        cpu: '100m'\n      limits:\n        memory: '128Mi'\n        cpu: '200m'\nEOF",
          "kubectl describe pod resource-pod",
          "kubectl top pod resource-pod"
        ],
        explanation: "Definir recursos garante que containers tenham recursos suficientes e não consumam excessivamente recursos do cluster.",
        completed: false
      },
      {
        id: 10,
        title: "Limpeza de Pods",
        description: "Aprenda a remover pods e limpar recursos",
        commands: [
          "kubectl delete pod nginx-pod",
          "kubectl delete pod multi-container",
          "kubectl delete pod resource-pod",
          "kubectl get pods"
        ],
        explanation: "Limpar recursos não utilizados é importante para manter o cluster organizado e economizar recursos.",
        completed: false
      }
    ]
  },
  {
    id: 3,
    title: "Deployments e ReplicaSets",
    description: "Aprenda a gerenciar aplicações com alta disponibilidade",
    icon: "Layers",
    lessons: [
      {
        id: 11,
        title: "Criando seu Primeiro Deployment",
        description: "Deploy uma aplicação com múltiplas réplicas",
        commands: [
          "kubectl create deployment nginx-deployment --image=nginx:latest --replicas=3",
          "kubectl get deployments",
          "kubectl get replicasets",
          "kubectl get pods -l app=nginx-deployment"
        ],
        explanation: "Deployments gerenciam ReplicaSets e garantem que um número específico de pods esteja sempre em execução.",
        completed: false
      },
      {
        id: 12,
        title: "Escalando Deployments",
        description: "Ajuste o número de réplicas conforme necessário",
        commands: [
          "kubectl scale deployment nginx-deployment --replicas=5",
          "kubectl get pods -l app=nginx-deployment",
          "kubectl scale deployment nginx-deployment --replicas=2",
          "kubectl get pods -l app=nginx-deployment -w"
        ],
        explanation: "Escalar aplicações é fundamental para lidar com variações de carga. Kubernetes automaticamente cria ou remove pods.",
        completed: false
      },
      {
        id: 13,
        title: "Atualizações Rolling",
        description: "Atualize aplicações sem tempo de inatividade",
        commands: [
          "kubectl set image deployment/nginx-deployment nginx=nginx:1.20",
          "kubectl rollout status deployment/nginx-deployment",
          "kubectl rollout history deployment/nginx-deployment",
          "kubectl describe deployment nginx-deployment"
        ],
        explanation: "Rolling updates permitem atualizar aplicações gradualmente, mantendo a disponibilidade durante o processo.",
        completed: false
      },
      {
        id: 14,
        title: "Rollback de Deployments",
        description: "Reverta para versões anteriores quando necessário",
        commands: [
          "kubectl rollout undo deployment/nginx-deployment",
          "kubectl rollout status deployment/nginx-deployment",
          "kubectl rollout undo deployment/nginx-deployment --to-revision=1",
          "kubectl get pods -l app=nginx-deployment"
        ],
        explanation: "Rollbacks são essenciais para reverter rapidamente atualizações problemáticas, garantindo a estabilidade do serviço.",
        completed: false
      },
      {
        id: 15,
        title: "Monitoramento de Deployments",
        description: "Monitore o status e saúde dos deployments",
        commands: [
          "kubectl get deployment nginx-deployment -o yaml",
          "kubectl describe deployment nginx-deployment",
          "kubectl get events --sort-by=.metadata.creationTimestamp",
          "kubectl logs -l app=nginx-deployment --tail=10"
        ],
        explanation: "Monitorar deployments ajuda a identificar problemas rapidamente e entender o comportamento da aplicação.",
        completed: false
      }
    ]
  },
  {
    id: 4,
    title: "Services e Networking",
    description: "Domine a comunicação entre pods e acesso externo",
    icon: "Network",
    lessons: [
      {
        id: 16,
        title: "Criando ClusterIP Service",
        description: "Exponha pods para comunicação interna do cluster",
        commands: [
          "kubectl expose deployment nginx-deployment --port=80 --type=ClusterIP",
          "kubectl get services",
          "kubectl describe service nginx-deployment",
          "kubectl get endpoints nginx-deployment"
        ],
        explanation: "ClusterIP é o tipo padrão de service, permitindo comunicação entre pods dentro do cluster através de um IP estável.",
        completed: false
      },
      {
        id: 17,
        title: "Testando Conectividade Interna",
        description: "Verifique a comunicação entre services",
        commands: [
          "kubectl run test-pod --image=busybox --rm -it --restart=Never -- wget -qO- nginx-deployment",
          "kubectl get service nginx-deployment -o yaml",
          "kubectl run debug-pod --image=nicolaka/netshoot --rm -it --restart=Never -- nslookup nginx-deployment"
        ],
        explanation: "Testar conectividade garante que os services estão funcionando corretamente e os pods podem se comunicar.",
        completed: false
      },
      {
        id: 18,
        title: "NodePort Service",
        description: "Acesse aplicações de fora do cluster",
        commands: [
          "kubectl expose deployment nginx-deployment --port=80 --type=NodePort --name=nginx-nodeport",
          "kubectl get services nginx-nodeport",
          "minikube service nginx-nodeport --url",
          "curl $(minikube service nginx-nodeport --url)"
        ],
        explanation: "NodePort permite acesso externo ao cluster através de uma porta específica em cada node do cluster.",
        completed: false
      },
      {
        id: 19,
        title: "Explorando DNS do Cluster",
        description: "Entenda como funciona a resolução de nomes",
        commands: [
          "kubectl get services -n kube-system",
          "kubectl run dns-test --image=busybox --rm -it --restart=Never -- nslookup kubernetes.default",
          "kubectl run dns-test --image=busybox --rm -it --restart=Never -- nslookup nginx-deployment.default.svc.cluster.local",
          "kubectl describe service kube-dns -n kube-system"
        ],
        explanation: "O DNS do Kubernetes permite que pods se encontrem usando nomes de service, facilitando a comunicação entre aplicações.",
        completed: false
      },
      {
        id: 20,
        title: "Load Balancing e Sessões",
        description: "Entenda como o tráfego é distribuído",
        commands: [
          "kubectl get endpoints nginx-deployment -o yaml",
          "for i in {1..10}; do kubectl run test-$i --image=busybox --rm --restart=Never -- wget -qO- nginx-deployment | grep -o 'Server.*'; done",
          "kubectl describe service nginx-deployment",
          "kubectl get pods -l app=nginx-deployment -o wide"
        ],
        explanation: "Services fazem load balancing automático entre pods saudáveis, distribuindo o tráfego de forma equilibrada.",
        completed: false
      }
    ]
  },
  {
    id: 5,
    title: "Configuração e Dados Persistentes",
    description: "Gerencie configurações, segredos e volumes persistentes",
    icon: "Database",
    lessons: [
      {
        id: 21,
        title: "ConfigMaps para Configuração",
        description: "Armazene configurações separadas do código",
        commands: [
          "kubectl create configmap app-config --from-literal=database_url=postgresql://localhost:5432/mydb",
          "kubectl get configmaps",
          "kubectl describe configmap app-config",
          "kubectl get configmap app-config -o yaml"
        ],
        explanation: "ConfigMaps permitem separar configurações do código da aplicação, facilitando mudanças sem rebuild de imagens.",
        completed: false
      },
      {
        id: 22,
        title: "Secrets para Dados Sensíveis",
        description: "Gerencie senhas e tokens de forma segura",
        commands: [
          "kubectl create secret generic db-secret --from-literal=username=admin --from-literal=password=secretpassword",
          "kubectl get secrets",
          "kubectl describe secret db-secret",
          "kubectl get secret db-secret -o yaml"
        ],
        explanation: "Secrets armazenam dados sensíveis de forma mais segura que ConfigMaps, com codificação base64 por padrão.",
        completed: false
      },
      {
        id: 23,
        title: "Usando ConfigMaps e Secrets em Pods",
        description: "Injete configurações em containers",
        commands: [
          "kubectl apply -f - <<EOF\napiVersion: v1\nkind: Pod\nmetadata:\n  name: config-pod\nspec:\n  containers:\n  - name: app\n    image: busybox\n    command: ['sleep', '3600']\n    env:\n    - name: DATABASE_URL\n      valueFrom:\n        configMapKeyRef:\n          name: app-config\n          key: database_url\n    - name: DB_USERNAME\n      valueFrom:\n        secretKeyRef:\n          name: db-secret\n          key: username\nEOF",
          "kubectl exec config-pod -- env | grep -E '(DATABASE_URL|DB_USERNAME)'"
        ],
        explanation: "ConfigMaps e Secrets podem ser injetados como variáveis de ambiente ou volumes, fornecendo configurações aos containers.",
        completed: false
      },
      {
        id: 24,
        title: "Volumes Persistentes",
        description: "Armazene dados que sobrevivem ao ciclo de vida dos pods",
        commands: [
          "kubectl apply -f - <<EOF\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: my-pvc\nspec:\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 1Gi\nEOF",
          "kubectl get pvc",
          "kubectl describe pvc my-pvc"
        ],
        explanation: "PersistentVolumeClaims (PVC) solicitam armazenamento persistente, permitindo que dados sobrevivam à recriação de pods.",
        completed: false
      },
      {
        id: 25,
        title: "Aplicação com Dados Persistentes",
        description: "Deploy uma aplicação que usa volumes persistentes",
        commands: [
          "kubectl apply -f - <<EOF\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: persistent-app\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: persistent-app\n  template:\n    metadata:\n      labels:\n        app: persistent-app\n    spec:\n      containers:\n      - name: app\n        image: nginx\n        volumeMounts:\n        - name: data\n          mountPath: /usr/share/nginx/html\n      volumes:\n      - name: data\n        persistentVolumeClaim:\n          claimName: my-pvc\nEOF",
          "kubectl get deployment persistent-app",
          "kubectl exec -it deployment/persistent-app -- sh -c 'echo \"Persistent Data\" > /usr/share/nginx/html/index.html'",
          "kubectl delete pod -l app=persistent-app",
          "kubectl exec -it deployment/persistent-app -- cat /usr/share/nginx/html/index.html"
        ],
        explanation: "Volumes persistentes garantem que dados importantes não sejam perdidos quando pods são recriados ou movidos entre nodes.",
        completed: false
      }
    ]
  }
];
