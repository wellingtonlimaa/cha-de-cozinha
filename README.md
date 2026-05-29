# Chá de Cozinha

Site de chá de cozinha com convite digital, confirmação de presença e lista
de presentes com reserva em tempo real.

Stack: **React 18 + Vite + Supabase**.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Configuração inicial](#configuração-inicial)
  - [1. Instalar dependências](#1-instalar-dependências)
  - [2. Criar projeto no Supabase](#2-criar-projeto-no-supabase)
  - [3. Variáveis de ambiente](#3-variáveis-de-ambiente)
  - [4. Rodar o schema SQL](#4-rodar-o-schema-sql)
- [Desenvolvimento](#desenvolvimento)
- [Build de produção](#build-de-produção)
- [Deploy em VPS](#deploy-em-vps)
  - [Passo a passo na VPS](#passo-a-passo-na-vps)
  - [Configuração do nginx](#configuração-do-nginx)
  - [HTTPS com Let's Encrypt](#https-com-lets-encrypt)
- [Personalização](#personalização)
- [Estrutura do projeto](#estrutura-do-projeto)

---

## Funcionalidades

- **Convite digital** com data, casal, mensagem e endereço
- **Envelope animado** que abre revelando o convite
- **Stepper de progresso** que acompanha o convidado: confirmar → reservar → pronto
- **Confirmação de presença** com:
  - Máscara automática de telefone `(00) 00000-0000`
  - Validação de telefone (10 ou 11 dígitos)
  - Persistência no Supabase (UPSERT por telefone)
- **Lista de presentes** com busca, filtros, paginação e **skeleton loaders**
- **Reserva de presente** com:
  - Atualização em tempo real (Supabase Realtime) — outros convidados veem a reserva na hora
  - Trava de duplicação no banco (chave primária por `product_id`)
  - Cancelamento da própria reserva (validado por telefone)
- **PIX** com **QR Code** gerado automaticamente + botão "Copiar"
- **Painel administrativo** (`/admin`) protegido por senha — confirmações + reservas + export CSV
- **Botão flutuante WhatsApp** (configurável)
- **Botão "voltar ao topo"** ao rolar a página
- **PWA**: instalável como app no celular (manifest + ícones)
- **Navbar fixa** com glassmorphism + menu mobile
- Design responsivo, animações suaves, navegação acessível
- Suporte a `prefers-reduced-motion`

## Stack

- React 18, Vite 5
- Supabase (Postgres + Realtime + RLS)
- CSS puro, sem framework, organizado por seção

## Pré-requisitos

- **Node.js** 18 ou superior
- Conta gratuita no [Supabase](https://supabase.com)

## Configuração inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Escolha a região mais próxima do seu público (ex.: `South America (São Paulo)`)
3. Anote a **senha do banco** num lugar seguro
4. Vá em **Project Settings → API** e copie:
   - **Project URL** (ex.: `https://xxxxx.supabase.co`)
   - **Publishable / anon key** (começa com `sb_publishable_...` ou `eyJ...`)

⚠️ **Nunca use a `service_role` key no frontend** — ela é admin total do banco.

### 3. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

E preencha:

```env
# Obrigatórias
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# Opcionais
VITE_ADMIN_PASSWORD=senha-do-painel-admin   # se vazio, /admin fica indisponível
VITE_WHATSAPP_NUMBER=5511999998888          # se vazio, botão WhatsApp some
```

### 4. Rodar o schema SQL

No painel do Supabase, vá em **SQL Editor → New Query**, cole o conteúdo de
[`supabase-schema.sql`](./supabase-schema.sql) e clique em **Run**.

Isso cria duas tabelas (`reservations` e `guests`) com suas RLS policies e
ativa o realtime.

## Desenvolvimento

```bash
npm run dev
```

Abre em [http://localhost:5173](http://localhost:5173).

## Build de produção

```bash
npm run build
```

Gera a pasta `dist/` com os arquivos estáticos prontos pra servir.

Pra testar a build localmente:

```bash
npm run preview
```

## Deploy em VPS

A aplicação é 100% **estática** depois do build — qualquer servidor web
(nginx, Caddy, Apache) consegue servir. Recomendamos **nginx**.

### Passo a passo na VPS

Assumindo Ubuntu/Debian, domínio `chadecozinha.seudominio.com`:

```bash
# 1. SSH na VPS
ssh usuario@seu-ip

# 2. Instalar dependências
sudo apt update
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Clonar o projeto
sudo mkdir -p /var/www
cd /var/www
sudo git clone <url-do-seu-repo> cha-de-cozinha
cd cha-de-cozinha

# 4. Instalar dependências e gerar build
sudo npm install
sudo cp .env.example .env
sudo nano .env   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
sudo npm run build

# 5. Copiar config do nginx (ver abaixo)
sudo cp nginx.conf.example /etc/nginx/sites-available/cha-de-cozinha
sudo nano /etc/nginx/sites-available/cha-de-cozinha   # ajuste server_name
sudo ln -s /etc/nginx/sites-available/cha-de-cozinha /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Para atualizar o site depois de mudanças:

```bash
cd /var/www/cha-de-cozinha
git pull
npm install
npm run build
# nginx serve a pasta dist/, não precisa reiniciar
```

### Configuração do nginx

O arquivo [`nginx.conf.example`](./nginx.conf.example) está pronto pra usar.
Pontos importantes:

- Serve a pasta `dist/`
- Tem **fallback de SPA** (`try_files $uri /index.html`) — qualquer rota cai no `index.html`
- Cache longo para assets com hash, sem cache para `index.html`
- Compressão gzip ativa

### HTTPS com Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d chadecozinha.seudominio.com
```

O certbot ajusta o nginx automaticamente. Renovação é automática via cron.

## Notificações por email (opcional)

Quando alguém reserva um presente, é possível disparar um email automático
para o casal. Usa **Resend** + uma **Edge Function do Supabase**.

### 1. Criar conta no Resend

1. Acesse [resend.com](https://resend.com) e crie conta (free tier dá 100/dia)
2. Em **API Keys** → **Create API Key** → copie o valor
3. Para enviar do seu próprio domínio, cadastre o domínio em **Domains**.
   Sem domínio próprio, use o sandbox `onboarding@resend.dev` (só envia para o e-mail cadastrado na conta).

### 2. Instalar a Supabase CLI (uma vez)

```bash
npm install -g supabase
supabase login
```

### 3. Configurar secrets na Supabase

```bash
cd cha-de-cozinha
supabase link --project-ref <seu-project-ref>

supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
supabase secrets set ADMIN_EMAIL=casal@gmail.com
supabase secrets set FROM_EMAIL=onboarding@resend.dev
supabase secrets set SITE_URL=https://chadecozinha.seudominio.com
```

> `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já vêm injetados automaticamente
> nas funções deployadas, não precisa setar.

### 4. Deploy da função

```bash
supabase functions deploy notify-reservation --no-verify-jwt
```

### 5. Criar o webhook

No painel do Supabase:

1. **Database → Webhooks → Create a new hook**
2. Preencha:
   - Nome: `notify-on-reservation`
   - Tabela: `reservations`
   - Eventos: marca apenas **INSERT**
   - Tipo: **HTTP Request**
   - URL: `https://<seu-project>.supabase.co/functions/v1/notify-reservation`
   - HTTP Method: `POST`
   - Headers: deixa vazio (a função aceita sem JWT)

3. Salva. Pronto — agora cada nova reserva dispara um email pro casal.

Para testar: faça uma reserva qualquer no site e veja se o email chega.

---

## Painel administrativo

Acesse pelo navegador em `https://seudominio.com/#/admin`. Você vai precisar
da senha definida em `VITE_ADMIN_PASSWORD`.

O painel mostra:
- **Confirmações de presença** com nome, telefone, quantidade
- **Reservas** com presente, cor, quem reservou e quando
- Estatísticas (% da lista reservada)
- Botões de **exportar CSV**

A senha fica guardada em `sessionStorage`, expira ao fechar o navegador.

> ⚠️ Esse esquema de senha é client-side (só esconde a UI). Os dados em si
> ficam acessíveis via API do Supabase com a chave anon. Para um chá de
> cozinha entre amigos isso é o suficiente. Para uso comercial, considere
> mover para Supabase Auth.

## Personalização

Os textos e configurações do evento ficam em
[`src/lib/constants.js`](./src/lib/constants.js):

```js
export const COUPLE_NAME = 'Manu & Vitor'
export const COUPLE_MONOGRAM = 'M&V'
export const PIX_KEY = 'pix-chave@exemplo.com'

export const EVENT_INFO = {
  message: '...',
  dayLabel: 'domingo',
  timeLabel: 'às 14h',
  monthLabel: 'junho',
  yearLabel: '2026',
  dayNumber: '07',
  address: '...',
  mapsLink: '...',
}
```

Para a lista de presentes, edite [`src/data/products.js`](./src/data/products.js).

Cada produto tem:

```js
{
  id: 1,                              // único, chave do banco
  code: 'CC-001',                     // código de referência
  name: 'Jogo de talheres',
  category: 'Cozinha',                // ver CATEGORY_ORDER em constants.js
  color: 'Bambu',                     // gera cor da ilustração — ver imageBuilder.js
  imageUrl: '',                       // se vazio, gera SVG; preencha pra usar foto real
  referenceLink: 'https://...',
}
```

## Estrutura do projeto

```
cha-de-cozinha/
├── index.html                  # entry HTML, meta tags
├── package.json
├── vite.config.js              # build config
├── nginx.conf.example          # exemplo de config nginx pra VPS
├── supabase-schema.sql         # schema SQL pra rodar no Supabase
├── .env.example                # template das variáveis
├── README.md
└── src/
    ├── main.jsx                # entry React
    ├── App.jsx                 # orquestrador principal
    ├── styles.css              # CSS único, organizado por seção
    ├── data/
    │   └── products.js         # lista de presentes
    ├── lib/
    │   ├── constants.js        # configs do evento
    │   ├── imageBuilder.js     # gera SVGs dinâmicos para os produtos
    │   └── supabase.js         # cliente Supabase
    ├── hooks/
    │   ├── useGuest.js         # confirmação de presença
    │   ├── useReservations.js  # carregamento + realtime de reservas
    │   └── useToast.js         # notificações
    └── components/
        ├── Navbar.jsx          # navegação fixa no topo
        ├── Hero.jsx            # convite assimétrico
        ├── Stepper.jsx         # indicador de progresso
        ├── Envelope.jsx        # convite animado
        ├── HomeSection.jsx
        ├── LocationSection.jsx
        ├── AttendanceSection.jsx
        ├── GiftsSection.jsx
        ├── ProductCard.jsx
        ├── ProductModal.jsx
        ├── PixSection.jsx
        ├── Toast.jsx
        ├── ErrorBoundary.jsx
        └── Decorations.jsx     # ícones e SVGs decorativos
```

---

Feito com ☕ — sinta-se à vontade para customizar.
