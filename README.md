# 🚀 TODO LIST PRO - BACKEND API

API REST completa para gerenciamento de tarefas com Node.js, Express, TypeScript e Supabase.

---

## 📋 PASSO A PASSO - CONFIGURAÇÃO E EXECUÇÃO

### ✅ PRÉ-REQUISITOS

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js** versão 18 ou superior
  - Verificar: `node --version`
  - Download: https://nodejs.org/
  
- ✅ **npm** ou **yarn**
  - Verificar: `npm --version`
  
- ✅ **Projeto Supabase** configurado
  - Você deve ter feito a Etapa 1 (configuração do Supabase)
  - Ter em mãos: SUPABASE_URL e SUPABASE_SERVICE_KEY

---

## 🛠️ PASSO 1: CLONAR/BAIXAR O PROJETO

Se você ainda não tem o código:

```bash
# Opção 1: Se estiver no repositório Git
git clone <url-do-repositorio>
cd todo-list-backend

# Opção 2: Se baixou o ZIP
# Extraia o arquivo e navegue até a pasta backend
cd caminho/para/backend
```

---

## 📦 PASSO 2: INSTALAR DEPENDÊNCIAS

Dentro da pasta `backend`, execute:

```bash
npm install
```

**O que acontece aqui:**
- O npm vai ler o `package.json`
- Vai baixar todas as bibliotecas necessárias
- Vai criar a pasta `node_modules` (pode demorar 1-2 minutos)

**Você verá algo como:**
```
added 543 packages in 45s
```

---

## 🔐 PASSO 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 3.1 - Criar arquivo .env

Na raiz da pasta `backend`, crie um arquivo chamado `.env` (sim, começa com ponto)

**No Windows:**
```bash
# Abra o bloco de notas ou VSCode
notepad .env
# ou
code .env
```

**No Mac/Linux:**
```bash
nano .env
# ou
code .env
```

### 3.2 - Preencher as variáveis

Cole o seguinte conteúdo no arquivo `.env` e substitua pelos seus valores:

```env
# ========================================
# CONFIGURAÇÕES DO SERVIDOR
# ========================================
PORT=3001
NODE_ENV=development

# ========================================
# SUPABASE CREDENTIALS
# ========================================
# IMPORTANTE: Cole aqui as credenciais que você salvou na Etapa 1

# Exemplo: https://abcdefghijk.supabase.co
SUPABASE_URL=cole_aqui_sua_url_do_supabase

# ATENÇÃO: Use a SERVICE ROLE KEY, NÃO a anon key!
# A service role key é a chave PRIVADA
SUPABASE_SERVICE_KEY=cole_aqui_sua_service_role_key

# ========================================
# CORS (Frontend URL)
# ========================================
# Por enquanto, deixe assim (vamos mudar depois)
FRONTEND_URL=http://localhost:5173

# ========================================
# RATE LIMITING
# ========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ========================================
# JWT (para futuras expansões)
# ========================================
JWT_SECRET=mude_este_secret_para_algo_seguro_em_producao
```

### 3.3 - Salvar o arquivo

**Muito importante:**
- Salve o arquivo como `.env` (com o ponto na frente)
- Certifique-se de que está na raiz da pasta `backend`
- **NUNCA** compartilhe esse arquivo ou suba no Git!

---

## ▶️ PASSO 4: EXECUTAR O SERVIDOR

Agora vamos rodar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

**O que você deve ver:**

```
🎯 ===================================
🚀 Todo List Pro API
🎯 ===================================
📡 Servidor rodando na porta: 3001
🌍 Ambiente: development
🔗 URL: http://localhost:3001
✅ Health Check: http://localhost:3001/api/health
🎯 ===================================
✅ Supabase conectado com sucesso!
```

**Se aparecer isso, PARABÉNS! 🎉 Seu backend está rodando!**

---

## 🧪 PASSO 5: TESTAR A API

### 5.1 - Teste pelo navegador

Abra seu navegador e acesse:

```
http://localhost:3001/api/health
```

Você deve ver:

```json
{
  "success": true,
  "message": "API Todo List Pro está funcionando! 🚀",
  "timestamp": "2024-..."
}
```

### 5.2 - Teste com ferramentas

**Opção 1: Usar o Postman**
1. Baixe o Postman: https://www.postman.com/downloads/
2. Crie uma nova requisição GET
3. URL: `http://localhost:3001/api/health`
4. Clique em "Send"

**Opção 2: Usar o Thunder Client (extensão do VSCode)**
1. Instale a extensão "Thunder Client" no VSCode
2. Abra e crie uma nova requisição
3. GET `http://localhost:3001/api/health`

**Opção 3: Usar o terminal (curl)**
```bash
curl http://localhost:3001/api/health
```

---

## 📚 ESTRUTURA DO PROJETO

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Configuração do cliente Supabase
│   ├── controllers/
│   │   ├── tasks.controller.ts      # Lógica de tarefas
│   │   ├── categories.controller.ts # Lógica de categorias
│   │   ├── subtasks.controller.ts   # Lógica de subtarefas
│   │   ├── analytics.controller.ts  # Lógica de analytics
│   │   └── profile.controller.ts    # Lógica de perfil
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # Autenticação JWT
│   │   ├── error.middleware.ts      # Tratamento de erros
│   │   └── validation.middleware.ts # Validação com Joi
│   ├── routes/
│   │   ├── tasks.routes.ts          # Rotas de tarefas
│   │   ├── categories.routes.ts     # Rotas de categorias
│   │   ├── subtasks.routes.ts       # Rotas de subtarefas
│   │   ├── analytics.routes.ts      # Rotas de analytics
│   │   ├── profile.routes.ts        # Rotas de perfil
│   │   └── index.ts                 # Agregador de rotas
│   ├── types/
│   │   └── index.ts                 # Definições TypeScript
│   └── server.ts                    # Arquivo principal
├── .env                             # Variáveis de ambiente (NÃO versionar!)
├── .env.example                     # Exemplo de variáveis
├── .gitignore                       # Arquivos ignorados pelo Git
├── package.json                     # Dependências e scripts
├── tsconfig.json                    # Configuração TypeScript
└── README.md                        # Este arquivo
```

---

## 🛣️ ROTAS DISPONÍVEIS

### 🔐 Autenticação

Todas as rotas (exceto `/health`) requerem autenticação.

**Header obrigatório:**
```
Authorization: Bearer <seu_token_do_supabase>
```

### 📋 TAREFAS (Tasks)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/tasks` | Listar todas as tarefas |
| GET | `/api/tasks/today` | Tarefas de hoje |
| GET | `/api/tasks/overdue` | Tarefas atrasadas |
| GET | `/api/tasks/:id` | Buscar tarefa específica |
| POST | `/api/tasks` | Criar nova tarefa |
| PUT | `/api/tasks/:id` | Atualizar tarefa |
| PATCH | `/api/tasks/:id/toggle` | Marcar como completa/incompleta |
| PUT | `/api/tasks/reorder` | Reordenar tarefas (drag & drop) |
| DELETE | `/api/tasks/:id` | Deletar tarefa |

**Exemplo de criação:**
```json
POST /api/tasks
{
  "title": "Implementar login",
  "description": "Criar tela de login com validação",
  "priority": "high",
  "category_id": "uuid-da-categoria",
  "due_date": "2024-02-15T10:00:00Z",
  "tags": ["frontend", "auth"]
}
```

### 📁 CATEGORIAS (Categories)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/categories` | Listar categorias |
| GET | `/api/categories/:id` | Buscar categoria |
| POST | `/api/categories` | Criar categoria |
| PUT | `/api/categories/:id` | Atualizar categoria |
| DELETE | `/api/categories/:id` | Deletar categoria |

### ✅ SUBTAREFAS (Subtasks)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/tasks/:taskId/subtasks` | Listar subtarefas |
| POST | `/api/tasks/:taskId/subtasks` | Criar subtarefa |
| PUT | `/api/tasks/:taskId/subtasks/:id` | Atualizar subtarefa |
| PATCH | `/api/tasks/:taskId/subtasks/:id/toggle` | Toggle completa |
| DELETE | `/api/tasks/:taskId/subtasks/:id` | Deletar subtarefa |

### 📊 ANALYTICS

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/analytics/statistics` | Estatísticas gerais |
| GET | `/api/analytics/productivity` | Produtividade por dia |
| GET | `/api/analytics/categories` | Distribuição por categoria |
| GET | `/api/analytics/priorities` | Distribuição por prioridade |
| GET | `/api/analytics/activity` | Log de atividades |
| GET | `/api/analytics/pomodoro` | Sessões Pomodoro |
| POST | `/api/analytics/pomodoro` | Criar sessão Pomodoro |
| PATCH | `/api/analytics/pomodoro/:id/complete` | Completar Pomodoro |

### 👤 PERFIL (Profile)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/profile` | Obter perfil |
| PUT | `/api/profile` | Atualizar perfil |
| DELETE | `/api/profile` | Deletar conta |

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### ❌ Erro: "Cannot find module"

**Solução:**
```bash
# Delete node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

### ❌ Erro: "SUPABASE_URL is required"

**Problema:** Arquivo `.env` não foi criado ou está incompleto

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Confirme que as variáveis estão preenchidas corretamente
3. Reinicie o servidor: `Ctrl+C` e depois `npm run dev`

### ❌ Erro: "Port 3001 already in use"

**Problema:** Já existe algo rodando na porta 3001

**Solução:**

**Opção 1:** Mudar a porta no `.env`
```env
PORT=3002
```

**Opção 2:** Matar o processo na porta 3001

**No Windows:**
```bash
netstat -ano | findstr :3001
taskkill /PID <numero_do_pid> /F
```

**No Mac/Linux:**
```bash
lsof -ti:3001 | xargs kill -9
```

### ❌ Erro 401 ao testar rotas

**Problema:** Falta o token de autenticação

**Solução:**
- As rotas precisam do header `Authorization: Bearer <token>`
- Você vai conseguir o token quando criar o frontend (próxima etapa)
- Por enquanto, só teste a rota `/api/health`

### ❌ Erro de conexão com Supabase

**Problema:** Credenciais incorretas

**Solução:**
1. Volte no Supabase → Settings → API
2. Confirme que copiou a URL e SERVICE ROLE KEY corretas
3. Cole novamente no `.env`
4. Reinicie o servidor

---

## 📝 SCRIPTS DISPONÍVEIS

```bash
# Rodar em desenvolvimento (com hot reload)
npm run dev

# Compilar TypeScript para JavaScript
npm run build

# Rodar em produção (após build)
npm start

# Verificar erros de lint
npm run lint

# Rodar testes (quando implementados)
npm test
```

---

## 🔒 SEGURANÇA

- ✅ Helmet para proteção de headers
- ✅ CORS configurado
- ✅ Rate limiting (100 req/15min por IP)
- ✅ Validação de dados com Joi
- ✅ Row Level Security no Supabase
- ✅ Autenticação JWT via Supabase
- ✅ Sanitização de inputs

---

## 🎯 PRÓXIMOS PASSOS

Agora que o backend está rodando:

1. ✅ Backend configurado e testado
2. ⏭️ **PRÓXIMA ETAPA: Criar o Frontend (React + TypeScript)**

**Quando estiver pronto, me confirme que o backend está rodando 100% e vamos para a Etapa 3!** 🚀

---

## 📞 SUPORTE

Se encontrar algum problema:
1. Verifique os logs no terminal onde rodou `npm run dev`
2. Confirme que o Supabase está configurado corretamente
3. Verifique se as variáveis de ambiente estão corretas
4. Reinicie o servidor e tente novamente

---

**Desenvolvido com ❤️ e TypeScript**
