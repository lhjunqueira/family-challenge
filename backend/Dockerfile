FROM node:20-alpine

WORKDIR /app

# 1. Dependências do sistema
RUN apk add --no-cache openssl libc6-compat

# 2. Instala pnpm v10.11.0 e configura cache
RUN npm install -g pnpm@10.11.0 && \
    pnpm config set store-dir /root/.pnpm-store && \
    pnpm config set strict-peer-dependencies false

# 3. Copia arquivos de dependências primeiro (para cache eficiente)
COPY package.json pnpm-lock.yaml ./

# 4. Instalação robusta de dependências
RUN rm -rf node_modules && \
    pnpm install --frozen-lockfile && \
    pnpm store prune

# 5. Copia o código fonte
COPY . .

CMD ["pnpm", "run", "start:dev"]