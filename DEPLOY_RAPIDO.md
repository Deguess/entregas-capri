# 🚀 Deploy Rápido - GitHub Pages

## Opção Mais Simples: Railway (Recomendado)

### ✅ Vantagens
- Deploy automático backend + frontend
- Grátis até 500 horas/mês
- MongoDB incluído ou use MongoDB Atlas
- SSL automático
- Muito fácil de configurar

### 📝 Passo a Passo (5 minutos)

**1. MongoDB Atlas (Banco de Dados)**
```
→ Acesse: https://www.mongodb.com/cloud/atlas/register
→ Crie cluster gratuito (M0)
→ Database Access: Crie usuário (ex: admin / senha123)
→ Network Access: Adicione 0.0.0.0/0
→ Copie string de conexão:
  mongodb+srv://admin:senha123@cluster0.xxxxx.mongodb.net/
```

**2. GitHub (Código)**
```bash
# No seu computador:
cd /caminho/do/projeto
git init
git add .
git commit -m "Initial commit"

# Crie repositório no GitHub (https://github.com/new)
git remote add origin https://github.com/SEU-USUARIO/delivery-routes.git
git push -u origin main
```

**3. Railway (Deploy)**
```
→ Acesse: https://railway.app
→ Login with GitHub
→ New Project
→ Deploy from GitHub repo
→ Selecione seu repositório
→ Adicione variáveis:
  • MONGO_URL: cole a string do MongoDB Atlas
  • DB_NAME: delivery_routes
  • CORS_ORIGINS: *

→ Aguarde 5-10 minutos
→ Clique em "Settings" → "Generate Domain"
→ Pronto! Sua URL: https://seu-app.railway.app
```

**4. Popular Dados**
```bash
# Acesse sua URL/api no navegador
# Se aparecer {"message":"Delivery Route Optimizer API"}, funcionou!

# Para adicionar dados de teste, rode o script:
# Substitua a URL pelo seu deploy
python scripts/seed_data.py
```

---

## Alternativa: GitHub Pages + Render

### Frontend no GitHub Pages

**1. Instalar gh-pages**
```bash
cd frontend
npm install --save-dev gh-pages
```

**2. Editar `frontend/package.json`**
```json
{
  "name": "delivery-routes",
  "version": "1.0.0",
  "homepage": "https://SEU-USUARIO.github.io/delivery-routes",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build",
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

**3. Deploy**
```bash
npm run deploy
```

**4. Configurar GitHub Pages**
```
→ GitHub repo → Settings → Pages
→ Source: Deploy from a branch
→ Branch: gh-pages / root
→ Save
```

### Backend no Render

**1. Criar conta**
```
→ Acesse: https://render.com
→ Sign up with GitHub
```

**2. Novo Web Service**
```
→ New + → Web Service
→ Connect repository
→ Configurações:
  • Name: delivery-routes-api
  • Environment: Python 3
  • Build Command: pip install -r backend/requirements.txt
  • Start Command: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
```

**3. Variáveis de Ambiente**
```
→ Environment
→ Add Environment Variable:
  • MONGO_URL: sua string do MongoDB Atlas
  • DB_NAME: delivery_routes
  • CORS_ORIGINS: https://SEU-USUARIO.github.io
```

**4. Deploy**
```
→ Create Web Service
→ Aguarde 5-10 min
→ Copie URL: https://delivery-routes-api.onrender.com
```

**5. Atualizar Frontend**
```bash
# Edite frontend/.env.production
REACT_APP_BACKEND_URL=https://delivery-routes-api.onrender.com

# Deploy novamente
cd frontend
npm run deploy
```

---

## 🎯 URLs Finais

Após deploy completo:

### Railway
```
✅ Aplicação completa: https://seu-app.railway.app
✅ API: https://seu-app.railway.app/api
```

### GitHub Pages + Render
```
✅ Frontend: https://SEU-USUARIO.github.io/delivery-routes
✅ Backend: https://delivery-routes-api.onrender.com/api
```

---

## 🐛 Resolver Problemas

### Erro CORS
```python
# backend/server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-frontend.com", "*"],  # Adicione sua URL
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Erro 404 - API não encontrada
```
Verifique:
1. Backend está rodando? Acesse /api no navegador
2. URL do backend está correta no .env.production?
3. Todas as rotas têm prefixo /api?
```

### Build falhou
```bash
# Verifique dependências
cat backend/requirements.txt
cat frontend/package.json

# Reinstale
cd backend && pip install -r requirements.txt
cd frontend && npm install
```

### MongoDB não conecta
```
Verifique:
1. IP 0.0.0.0/0 liberado no MongoDB Atlas?
2. String de conexão está correta?
3. Usuário e senha estão corretos?
```

---

## 📞 Suporte

Encontrou algum problema?
- 📖 Guia completo: `DEPLOY_GUIDE.md`
- 🤖 Railway Docs: https://docs.railway.app
- 🎨 Render Docs: https://render.com/docs
- 📄 GitHub Pages: https://pages.github.com

---

## ✅ Checklist

- [ ] MongoDB Atlas configurado
- [ ] String de conexão copiada
- [ ] Código no GitHub
- [ ] Deploy do backend (Railway/Render)
- [ ] Deploy do frontend (Railway/GitHub Pages)
- [ ] URL do backend atualizada no frontend
- [ ] Dados de teste populados
- [ ] Aplicação testada e funcionando

🎉 **Pronto! Sua aplicação está no ar!**
