# =============================================================
# Dockerfile do Chá de Cozinha — build do Vite + Nginx
# Usado pelo EasyPanel (Hostinger VPS).
#
# As variáveis VITE_* são injetadas no momento do BUILD.
# Configure-as na aba "Environment" do serviço no EasyPanel;
# o EasyPanel as repassa como build args automaticamente.
# =============================================================

# ---- Etapa 1: build ----
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_ADMIN_PASSWORD
ARG VITE_WHATSAPP_NUMBER
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_ADMIN_PASSWORD=$VITE_ADMIN_PASSWORD \
    VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Etapa 2: servir ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
