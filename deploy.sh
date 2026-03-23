#!/bin/bash

# Script de Deploy Automatizado
# Sistema de Otimização de Rotas de Entrega

echo "🚀 Deploy - Sistema de Otimização de Rotas"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para perguntar
ask() {
    while true; do
        read -p "$1 (s/n): " yn
        case $yn in
            [Ss]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor, responda s ou n.";;
        esac
    done
}

# 1. Verificar Git
echo "📦 Verificando Git..."
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git não está instalado!${NC}"
    exit 1
fi

# 2. Verificar se é um repositório Git
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️  Repositório Git não inicializado${NC}"
    if ask "Deseja inicializar um repositório Git?"; then
        git init
        echo -e "${GREEN}✅ Repositório Git inicializado${NC}"
    else
        echo -e "${RED}❌ Deploy cancelado${NC}"
        exit 1
    fi
fi

# 3. Verificar arquivos importantes
echo ""
echo "📋 Verificando arquivos..."
files=("backend/requirements.txt" "backend/server.py" "frontend/package.json" "frontend/src/App.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file não encontrado${NC}"
        exit 1
    fi
done

# 4. Verificar .gitignore
if [ ! -f .gitignore ]; then
    echo -e "${YELLOW}⚠️  .gitignore não encontrado, criando...${NC}"
    cat > .gitignore << 'EOF'
node_modules/
__pycache__/
*.pyc
.venv/
venv/
.env
.env.local
build/
dist/
.DS_Store
*.log
EOF
    echo -e "${GREEN}✅ .gitignore criado${NC}"
fi

# 5. Adicionar arquivos ao Git
echo ""
echo "📝 Adicionando arquivos ao Git..."
git add .
git status

echo ""
if ask "Os arquivos acima estão corretos?"; then
    read -p "Digite a mensagem do commit: " commit_msg
    git commit -m "$commit_msg"
    echo -e "${GREEN}✅ Commit realizado${NC}"
else
    echo -e "${YELLOW}⚠️  Commit cancelado${NC}"
    exit 1
fi

# 6. Configurar remote
echo ""
echo "🔗 Configurando repositório remoto..."
if git remote | grep -q origin; then
    origin_url=$(git remote get-url origin)
    echo -e "Remote 'origin' já configurado: ${GREEN}$origin_url${NC}"
else
    read -p "Digite a URL do repositório GitHub (https://github.com/usuario/repo.git): " repo_url
    git remote add origin "$repo_url"
    echo -e "${GREEN}✅ Remote configurado${NC}"
fi

# 7. Push para GitHub
echo ""
if ask "Deseja fazer push para o GitHub agora?"; then
    git branch -M main
    git push -u origin main
    echo -e "${GREEN}✅ Código enviado para GitHub${NC}"
fi

# 8. Escolher plataforma de deploy
echo ""
echo "🌐 Escolha a plataforma de deploy:"
echo "1) Railway (Recomendado - Mais fácil)"
echo "2) Render (Frontend + Backend separados)"
echo "3) Vercel (Frontend + Backend juntos)"
echo "4) Apenas GitHub Pages (só frontend)"
read -p "Digite o número (1-4): " platform

case $platform in
    1)
        echo ""
        echo -e "${GREEN}📱 Railway Deploy${NC}"
        echo "1. Acesse: https://railway.app"
        echo "2. Conecte seu GitHub"
        echo "3. New Project → Deploy from GitHub"
        echo "4. Selecione seu repositório"
        echo "5. Configure variáveis de ambiente:"
        echo "   - MONGO_URL: sua string de conexão"
        echo "   - DB_NAME: delivery_routes"
        echo "6. Aguarde o deploy (5-10 min)"
        ;;
    2)
        echo ""
        echo -e "${GREEN}🎨 Render Deploy${NC}"
        echo ""
        echo "BACKEND:"
        echo "1. Acesse: https://render.com"
        echo "2. New → Web Service"
        echo "3. Conecte GitHub e selecione o repositório"
        echo "4. Configure:"
        echo "   - Build: pip install -r backend/requirements.txt"
        echo "   - Start: cd backend && uvicorn server:app --host 0.0.0.0 --port \$PORT"
        echo "5. Variáveis:"
        echo "   - MONGO_URL: sua string"
        echo "   - DB_NAME: delivery_routes"
        echo "   - CORS_ORIGINS: https://SEU-USUARIO.github.io"
        echo ""
        echo "FRONTEND:"
        echo "1. No repositório local:"
        echo "   cd frontend"
        echo "   yarn add -D gh-pages"
        echo "2. Edite package.json:"
        echo "   \"homepage\": \"https://SEU-USUARIO.github.io/delivery-routes\""
        echo "   \"scripts\": { \"deploy\": \"gh-pages -d build\" }"
        echo "3. Deploy:"
        echo "   yarn deploy"
        ;;
    3)
        echo ""
        echo -e "${GREEN}▲ Vercel Deploy${NC}"
        echo "1. Instale: npm i -g vercel"
        echo "2. Execute: vercel"
        echo "3. Configure MongoDB Atlas"
        echo "4. Adicione variável: vercel env add MONGO_URL"
        echo "5. Deploy prod: vercel --prod"
        ;;
    4)
        echo ""
        echo -e "${GREEN}📄 GitHub Pages${NC}"
        echo "1. cd frontend"
        echo "2. yarn add -D gh-pages"
        echo "3. Edite package.json:"
        echo "   \"homepage\": \"https://SEU-USUARIO.github.io/delivery-routes\""
        echo "4. yarn deploy"
        echo ""
        echo -e "${YELLOW}⚠️  Lembre-se: GitHub Pages é só frontend!${NC}"
        echo "Backend precisa estar em outro lugar (Render, Railway, etc)"
        ;;
esac

echo ""
echo -e "${GREEN}✨ Setup completo!${NC}"
echo ""
echo "📖 Guia completo: DEPLOY_GUIDE.md"
echo "🌐 Código no GitHub: $(git remote get-url origin 2>/dev/null || echo 'Configure o remote primeiro')"
echo ""
echo "🎉 Boa sorte com seu deploy!"
