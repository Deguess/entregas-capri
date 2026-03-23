# 📝 Comandos Úteis - Deploy GitHub

## 🔧 Configuração Inicial

### Instalar Dependências Globais
```bash
# Node.js e npm (se não tiver)
# Windows: https://nodejs.org/
# Mac: brew install node
# Linux: sudo apt install nodejs npm

# Git
# Windows: https://git-scm.com/
# Mac: brew install git
# Linux: sudo apt install git

# Vercel CLI (opcional)
npm install -g vercel

# Railway CLI (opcional)
npm install -g @railway/cli
```

## 🚀 Git e GitHub

### Inicializar Repositório
```bash
cd /seu/projeto
git init
git add .
git commit -m "Initial commit: Sistema de Otimização de Rotas"
```

### Conectar ao GitHub
```bash
# 1. Crie repositório em https://github.com/new

# 2. Conecte e envie
git remote add origin https://github.com/SEU-USUARIO/delivery-routes.git
git branch -M main
git push -u origin main
```

### Comandos Úteis Git
```bash
# Ver status
git status

# Adicionar arquivos
git add .
git add arquivo.js

# Commit
git commit -m "Mensagem do commit"

# Enviar para GitHub
git push

# Atualizar do GitHub
git pull

# Ver histórico
git log --oneline

# Criar branch
git checkout -b feature/nova-funcionalidade

# Voltar para main
git checkout main

# Ver diferenças
git diff
```

## 📦 Frontend (React)

### Desenvolvimento Local
```bash
cd frontend
npm install         # ou yarn install
npm start          # ou yarn start
# Abre em http://localhost:3000
```

### Build de Produção
```bash
cd frontend
npm run build      # ou yarn build
# Cria pasta build/ com arquivos otimizados
```

### Deploy GitHub Pages
```bash
cd frontend

# Instalar gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy

# Verificar
# Acesse: https://SEU-USUARIO.github.io/delivery-routes
```

### Atualizar Dependências
```bash
cd frontend

# Ver pacotes desatualizados
npm outdated

# Atualizar todos
npm update

# Atualizar específico
npm install react@latest
```

## ⚙️ Backend (FastAPI)

### Desenvolvimento Local
```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
venv\Scripts\activate

# Ativar (Mac/Linux)
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Rodar servidor
uvicorn server:app --reload --port 8001
# Acessa em http://localhost:8001
```

### Atualizar Dependências
```bash
cd backend

# Atualizar arquivo requirements.txt
pip freeze > requirements.txt

# Ou adicionar manualmente
echo "fastapi==0.109.0" >> requirements.txt
pip install -r requirements.txt
```

### Testar API
```bash
# Teste simples
curl http://localhost:8001/api/

# Criar pedido
curl -X POST http://localhost:8001/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "TEST01",
    "customer_name": "João",
    "address": "Rua Teste, 123",
    "cep": "01234-567",
    "delivery_start_time": "10:00",
    "delivery_end_time": "11:00"
  }'

# Listar pedidos
curl http://localhost:8001/api/pedidos
```

## 🗄️ MongoDB

### Conectar ao MongoDB Local
```bash
# Iniciar MongoDB
mongod

# Conectar
mongosh

# Comandos úteis
use delivery_routes
db.pedidos.find()
db.pedidos.countDocuments()
db.motoboys.find()
```

### MongoDB Atlas (Cloud)
```bash
# 1. Criar conta em mongodb.com
# 2. Criar cluster gratuito
# 3. Copiar string de conexão:
mongodb+srv://user:password@cluster.mongodb.net/

# 4. Testar conexão
mongosh "mongodb+srv://user:password@cluster.mongodb.net/"
```

## 🌐 Deploy - Railway

### CLI Railway
```bash
# Instalar
npm install -g @railway/cli

# Login
railway login

# Iniciar projeto
railway init

# Deploy
railway up

# Ver logs
railway logs

# Abrir dashboard
railway open
```

## 🌐 Deploy - Render

### Via Dashboard
```
1. https://render.com → New → Web Service
2. Conectar GitHub
3. Configurar build e start commands
4. Adicionar variáveis de ambiente
5. Deploy
```

### Via CLI (render.yaml)
```bash
# Commit render.yaml
git add render.yaml
git commit -m "Add Render config"
git push

# Deploy automático quando fizer push
```

## 🌐 Deploy - Vercel

### CLI Vercel
```bash
# Instalar
npm install -g vercel

# Login
vercel login

# Deploy desenvolvimento
vercel

# Deploy produção
vercel --prod

# Ver logs
vercel logs

# Adicionar variável de ambiente
vercel env add MONGO_URL
```

## 🔍 Debug e Logs

### Frontend (React)
```bash
# Abrir DevTools do navegador (F12)
# Console → ver erros JavaScript
# Network → ver requisições API
```

### Backend (FastAPI)
```bash
# Logs locais
# Terminal onde uvicorn está rodando

# Logs Railway
railway logs

# Logs Render
# Dashboard → Logs

# Logs Vercel
vercel logs --follow
```

### Testar Endpoints
```bash
# Instalar httpie (opcional)
pip install httpie

# Testar com httpie
http GET https://seu-app.railway.app/api/pedidos

# Ou usar curl
curl https://seu-app.railway.app/api/pedidos

# Ou usar Postman/Insomnia
```

## 📊 Popular Dados

### Dados de Teste
```bash
# Edite o script se necessário
nano scripts/seed_data.py

# Altere a URL para seu deploy
BACKEND_URL = "https://seu-app.railway.app"

# Execute
python scripts/seed_data.py
```

### Limpar Banco de Dados
```bash
# MongoDB local
mongosh
use delivery_routes
db.pedidos.deleteMany({})
db.motoboys.deleteMany({})
db.historico.deleteMany({})

# MongoDB Atlas
mongosh "mongodb+srv://..."
# Mesmos comandos acima
```

## 🔒 Segurança

### Variáveis de Ambiente
```bash
# NUNCA comite .env para GitHub!
# Sempre use .env.example como template

# .env.example
MONGO_URL=sua_string_aqui
DB_NAME=nome_do_banco
```

### GitHub Secrets
```bash
# Settings → Secrets → New repository secret
# Adicione:
# - MONGO_URL
# - DB_NAME
# etc.
```

## 🧪 Testes

### Testar Localmente Antes de Deploy
```bash
# 1. Backend
cd backend
uvicorn server:app --reload

# 2. Frontend (nova aba)
cd frontend
npm start

# 3. Abra http://localhost:3000
# 4. Teste todas as funcionalidades
```

## 📈 Monitoramento

### Verificar se está funcionando
```bash
# Health check
curl https://seu-app.railway.app/api/

# Deve retornar:
# {"message":"Delivery Route Optimizer API"}
```

### Ver uso de recursos
```bash
# Railway
railway status

# Render
# Dashboard → Metrics

# Vercel
vercel list
```

## 🆘 Resolver Problemas Comuns

### Erro: Module not found
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend  
cd backend
pip install -r requirements.txt
```

### Erro: Port already in use
```bash
# Windows
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8001 | xargs kill -9
```

### Erro: Git conflicts
```bash
# Resolver conflitos
git status
# Edite arquivos com conflitos
git add .
git commit -m "Resolve conflicts"
git push
```

## 🎓 Recursos Úteis

### Documentação
- Git: https://git-scm.com/doc
- React: https://react.dev
- FastAPI: https://fastapi.tiangolo.com
- MongoDB: https://docs.mongodb.com
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs

### Tutoriais
- Git/GitHub: https://guides.github.com
- React Deploy: https://create-react-app.dev/docs/deployment
- FastAPI Deploy: https://fastapi.tiangolo.com/deployment

---

💡 **Dica:** Salve este arquivo para referência rápida!
