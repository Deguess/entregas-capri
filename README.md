# Sistema de Otimização de Rotas de Entrega

Sistema completo para gerenciamento e otimização de rotas de entrega, com cálculo automático de rotas, visualização em mapa e geração de relatórios.

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral com estatísticas em tempo real
- Total de pedidos ativos, motoboys, entregas realizadas e quilometragem

### 📦 Gestão de Pedidos/Fichas
- Cadastro de pedidos com ID, cliente, endereço, CEP e horário
- Geocodificação automática de endereços usando Nominatim
- Horário de início calculado automaticamente (1 hora antes do fim)
- Listagem e exclusão de pedidos

### 👤 Gestão de Motoboys
- Cadastro de entregadores com nome e foto
- Visualização de equipe cadastrada
- Gerenciamento completo de entregadores

### 🗺️ Otimização de Rotas
- Seleção de pedidos por horário de entrega
- Definição do número de motoboys disponíveis
- Cálculo automático de rotas otimizadas usando OSRM
- Visualização interativa no mapa com:
  - Marcador do ponto inicial (empresa)
  - Marcadores de entregas por grupo
  - Rotas coloridas para cada motoboy
  - Distância total por rota

### ✅ Atribuição de Pedidos
- Atribuição manual de pedidos a motoboys específicos
- Salvamento automático no histórico

### 📈 Histórico de Entregas
- Visualização de todas as entregas realizadas
- Filtro por motoboy
- Estatísticas por entregador (entregas e km totais)
- **Geração de relatórios em PDF** com todas as informações

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web moderno e rápido
- **MongoDB** - Banco de dados NoSQL
- **Motor** - Driver async para MongoDB
- **ReportLab** - Geração de PDFs
- **HTTPX** - Cliente HTTP assíncrono

### Frontend
- **React** - Biblioteca para interfaces
- **React Router** - Navegação entre páginas
- **Leaflet** - Visualização de mapas
- **Lucide React** - Biblioteca de ícones
- **Sonner** - Notificações toast
- **Tailwind CSS** - Framework CSS

### APIs Externas (Gratuitas)
- **OSRM** - Cálculo de rotas otimizadas
- **Nominatim** - Geocodificação de endereços
- **OpenStreetMap** - Tiles de mapa (CartoDB Dark Matter)

## 🎨 Design

- **Tema:** Dark mode com paleta escura
- **Cores:** 
  - Background: `#09090b` (zinc-950)
  - Elementos: `#18181b` (zinc-900)
  - Acento: `#3b82f6` (azul elétrico)
  - Sucesso: `#22c55e` (verde neon)
- **Tipografia:** 
  - Inter (UI e texto)
  - JetBrains Mono (dados, IDs, coordenadas)
- **Estilo:** Minimalista, intuitivo, glassmorphism nos cards

## 📍 Ponto Inicial

**Endereço:** Rua Nossa Senhora das Mercês, 876 - Vila das Merces, São Paulo - SP, 04165-011  
**Coordenadas:** -23.633, -46.608

## 🚦 Como Usar

### 1. Cadastrar Motoboys
1. Acesse a aba "Motoboys"
2. Insira o nome do entregador
3. Selecione um avatar
4. Clique em "Cadastrar Motoboy"

### 2. Cadastrar Pedidos
1. Acesse a aba "Pedidos/Fichas"
2. Preencha:
   - ID do pedido (ex: F12, P34)
   - Nome do cliente
   - Endereço completo
   - CEP
   - Horário fim (início é calculado automaticamente)
3. Clique em "Cadastrar Pedido"
4. O sistema geocodifica automaticamente o endereço

### 3. Otimizar Rotas
1. Acesse a aba "Otimização"
2. Selecione o horário de entrega
3. Defina o número de motoboys disponíveis
4. Clique em "Otimizar Rotas"
5. Visualize as rotas calculadas no mapa

### 4. Atribuir Pedidos
1. Acesse a aba "Atribuir"
2. Selecione o motoboy para cada pedido
3. Clique em "Salvar Atribuições"

### 5. Gerar Relatórios
1. Acesse a aba "Histórico"
2. Clique em "Baixar PDF" no card do motoboy
3. O relatório será baixado com todas as entregas

## 📊 Dados de Teste

O sistema já vem populado com 20 pedidos de teste e 3 motoboys:

**Pedidos:** F12, P34, F7, P56, F21, P78, F3, P65, F44, P9, F28, P17, F59, P2, F73, P41, F66, P25, F80, P38

**Motoboys:** João Silva, Maria Santos, Pedro Costa

## 🔄 Populando Novos Dados

Para adicionar novos dados de teste:

```bash
python /app/scripts/seed_data.py
```

## 🌐 URLs

- **Frontend:** https://otimiza-rotas.preview.emergentagent.com
- **Backend API:** https://otimiza-rotas.preview.emergentagent.com/api

## 🚀 Como Fazer Deploy

### Opção 1: Railway (Recomendado - Mais Fácil)

```bash
# 1. Configure MongoDB Atlas (gratuito)
# 2. Faça push para GitHub
# 3. Conecte Railway ao seu repositório
# 4. Adicione variáveis de ambiente
# 5. Pronto! Deploy automático

📖 Guia rápido: DEPLOY_RAPIDO.md
```

### Opção 2: GitHub Pages + Render

```bash
# Frontend no GitHub Pages
cd frontend
npm run deploy

# Backend no Render
# Configure através do dashboard

📖 Guia completo: DEPLOY_GUIDE.md
```

### Deploy Automático

```bash
# Execute o script
chmod +x deploy.sh
./deploy.sh
```

## 📦 Arquivos de Configuração

- `render.yaml` - Configuração para Render
- `vercel.json` - Configuração para Vercel  
- `railway.json` - Configuração para Railway
- `.gitignore` - Arquivos ignorados pelo Git
- `deploy.sh` - Script de deploy automático

## 📝 Endpoints da API

- `GET /api/` - Health check
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Criar pedido
- `DELETE /api/pedidos/{id}` - Deletar pedido
- `POST /api/pedidos/{id}/geocode` - Geocodificar pedido
- `POST /api/geocode` - Geocodificar endereço
- `GET /api/motoboys` - Listar motoboys
- `POST /api/motoboys` - Criar motoboy
- `DELETE /api/motoboys/{id}` - Deletar motoboy
- `POST /api/optimize-routes` - Otimizar rotas
- `GET /api/historico` - Listar histórico
- `POST /api/historico` - Criar entrada no histórico
- `GET /api/historico/pdf/{motoboy_id}` - Gerar PDF do motoboy

## 🎯 Próximos Passos

Sugestões para melhorias futuras:

1. **Autenticação:** Adicionar login para múltiplos usuários
2. **Notificações:** Alertas para motoboys sobre novas entregas
3. **Rastreamento:** GPS em tempo real dos motoboys
4. **Analytics:** Dashboard com métricas avançadas
5. **Mobile:** Aplicativo para motoboys
6. **Integração:** WhatsApp/SMS para notificações
