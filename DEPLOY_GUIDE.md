# Guia de Deploy - GitHub Pages + Backend Gratuito

## 📋 Visão Geral

Como sua aplicação tem **frontend (React) + backend (FastAPI)**, você precisará:
- ✅ **Frontend** → GitHub Pages (gratuito)
- ✅ **Backend** → Render/Railway/Fly.io (gratuito)
- ✅ **Banco de Dados** → MongoDB Atlas (gratuito)

---

## 🚀 Opção 1: GitHub Pages (Frontend) + Render (Backend)

### Passo 1: Preparar o Backend para Render

1. **Criar arquivo `render.yaml`** na raiz do projeto:

```yaml
services:
  - type: web
    name: delivery-routes-api
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: MONGO_URL
        sync: false
      - key: DB_NAME
        value: delivery_routes
      - key: CORS_ORIGINS
        value: https://SEU-USUARIO.github.io
```

2. **Criar conta no MongoDB Atlas** (gratuito):
   - Acesse: https://www.mongodb.com/cloud/atlas/register
   - Crie um cluster gratuito
   - Em "Database Access", crie um usuário
   - Em "Network Access", adicione `0.0.0.0/0` (qualquer IP)
   - Copie a string de conexão (ex: `mongodb+srv://user:password@cluster.mongodb.net`)

3. **Fazer deploy no Render**:
   - Acesse: https://render.com
   - Conecte seu repositório GitHub
   - Crie um novo "Web Service"
   - Selecione seu repositório
   - Configure:
     - **Build Command**: `pip install -r backend/requirements.txt`
     - **Start Command**: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Adicione variáveis de ambiente:
     - `MONGO_URL`: sua string de conexão do MongoDB Atlas
     - `DB_NAME`: `delivery_routes`
     - `CORS_ORIGINS`: `https://SEU-USUARIO.github.io`
   - Clique em "Create Web Service"
   - Aguarde o deploy (5-10 min)
   - Copie a URL (ex: `https://delivery-routes-api.onrender.com`)

### Passo 2: Configurar o Frontend para GitHub Pages

1. **Instalar gh-pages**:
```bash
cd /app/frontend
yarn add -D gh-pages
```

2. **Atualizar `package.json`**:
```json
{
  "name": "delivery-routes-frontend",
  "version": "1.0.0",
  "homepage": "https://SEU-USUARIO.github.io/delivery-routes",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build",
    ...
  }
}
```

3. **Criar arquivo `.env.production`** em `/app/frontend/`:
```bash
REACT_APP_BACKEND_URL=https://delivery-routes-api.onrender.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

4. **Fazer deploy**:
```bash
cd /app/frontend
yarn deploy
```

5. **Configurar GitHub Pages**:
   - Vá em Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Salvar

Seu app estará em: `https://SEU-USUARIO.github.io/delivery-routes`

---

## 🚀 Opção 2: Vercel (Mais Simples - Frontend + Backend)

### Deploy Completo com 1 Comando

1. **Instalar Vercel CLI**:
```bash
npm i -g vercel
```

2. **Criar `vercel.json`** na raiz:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "backend/server.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "MONGO_URL": "@mongo-url",
    "DB_NAME": "delivery_routes"
  }
}
```

3. **Fazer deploy**:
```bash
cd /app
vercel
```

4. **Adicionar variáveis de ambiente**:
```bash
vercel env add MONGO_URL
# Cole sua string de conexão MongoDB Atlas
```

5. **Deploy production**:
```bash
vercel --prod
```

---

## 🚀 Opção 3: Railway (Mais Fácil)

1. **Acesse**: https://railway.app
2. **Conecte GitHub**: Autorize o Railway a acessar seu repositório
3. **New Project** → Deploy from GitHub repo
4. **Selecione seu repositório**
5. **Configure variáveis**:
   - `MONGO_URL`: string do MongoDB Atlas
   - `DB_NAME`: delivery_routes
6. **Railway detecta automaticamente** FastAPI e React
7. **Aguarde deploy** (5-10 min)
8. **Copie URL pública**

---

## 📦 Preparar Repositório GitHub

### 1. Criar `.gitignore`:
```bash
# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/

# Environment
.env
.env.local
.env.production

# Build
build/
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

### 2. Criar repositório:
```bash
cd /app
git init
git add .
git commit -m "Initial commit: Sistema de Otimização de Rotas"
```

### 3. Conectar ao GitHub:
```bash
# Crie um repositório no GitHub primeiro
git remote add origin https://github.com/SEU-USUARIO/delivery-routes.git
git branch -M main
git push -u origin main
```

---

## 🔧 Configurações Importantes

### Backend: Atualizar CORS

Atualize `backend/server.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "https://SEU-USUARIO.github.io",
        "https://seu-app.vercel.app",
        "http://localhost:3000"  # desenvolvimento
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend: Configurar Build

Em `frontend/package.json`, certifique-se:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

---

## 🎯 Comparação de Opções

| Serviço | Frontend | Backend | Banco | Dificuldade | Custo |
|---------|----------|---------|-------|-------------|-------|
| **GitHub Pages + Render** | ✅ | ✅ | MongoDB Atlas | Média | Grátis |
| **Vercel** | ✅ | ✅ | MongoDB Atlas | Fácil | Grátis |
| **Railway** | ✅ | ✅ | MongoDB Atlas | Muito Fácil | Grátis |

**Recomendação**: Use **Railway** para deploy mais simples e rápido!

---

## 🐛 Problemas Comuns

### CORS Error
- Adicione a URL do frontend no `CORS_ORIGINS` do backend

### Build Error
- Verifique se todas as dependências estão em `requirements.txt` e `package.json`

### 404 Not Found
- Certifique-se que o backend tem prefixo `/api` em todas as rotas
- Verifique se `REACT_APP_BACKEND_URL` está correto no frontend

### MongoDB Connection Error
- Verifique se o IP `0.0.0.0/0` está liberado no MongoDB Atlas
- Confirme que a string de conexão está correta

---

## 📞 URLs Finais

Após deploy, você terá:
- 🌐 **Frontend**: `https://SEU-USUARIO.github.io/delivery-routes`
- 🔌 **Backend API**: `https://seu-app.onrender.com/api`
- 📊 **MongoDB**: `mongodb+srv://...`

---

## ✅ Checklist de Deploy

- [ ] Criar conta MongoDB Atlas
- [ ] Obter string de conexão
- [ ] Criar repositório no GitHub
- [ ] Fazer push do código
- [ ] Escolher plataforma (Render/Vercel/Railway)
- [ ] Configurar variáveis de ambiente
- [ ] Fazer deploy backend
- [ ] Atualizar URL backend no frontend
- [ ] Fazer deploy frontend
- [ ] Testar aplicação
- [ ] Popular dados de teste

---

Precisa de ajuda com algum passo específico? Me avise!
