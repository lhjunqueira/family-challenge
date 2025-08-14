FROM node:18.20.7 AS dev

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install

COPY . .

EXPOSE 4200

CMD ["pnpm", "run", "start", "--host", "0.0.0.0"]
