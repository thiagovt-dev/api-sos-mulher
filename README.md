# API SOS Mulher

Plataforma de API construída com NestJS + Fastify, Prisma (PostgreSQL/PostGIS) e Bun. Fornece autenticação, gestão de incidentes, unidades policiais, localização em tempo real, filas (BullMQ/Redis) e documentação via Swagger.

## Stack
- **Runtime**: Bun 1.x (compatível Node)
- **Framework**: NestJS 11 + Fastify
- **ORM**: Prisma 6 (PostgreSQL/PostGIS)
- **Filas**: BullMQ + Redis
- **Docs**: Swagger em `/api/docs`
- **Testes**: Jest
- **Lint/Format**: ESLint + Prettier

## Funcionalidades
- **Autenticação/JWT** com perfis (Citizen, Police, Admin)
- **Incidentes**: abertura, despacho, eventos, status e encerramento
- **Unidades**: vínculo com usuários policiais, presença e telemetria
- **Localização**: amostras com índices por tempo/entidade
- **Dispositivos/Notificações**: tokens por plataforma (Android/iOS/Web)
- **WebSockets**: base para eventos em tempo real
- **Observabilidade**: health-check (Terminus) e integração opcional com Sentry

## Estrutura
- `src/`: código-fonte NestJS
- `prisma/`: schema, migrations e seeds
- `public/`: arquivos estáticos servidos em `/public`
- `dist/`: saída de build (gerada)

## Documentação (Swagger)
- Endpoints documentados em: `http://localhost:${PORT:-4000}/api/docs`
- Prefixo global da API: `/api`

## Variáveis de ambiente
Crie um arquivo `.env` na raiz (veja `env.example` para modelo). Principais variáveis:
- `PORT` (padrão: 4000)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`
- `DATABASE_URL` (veja exemplo em `env.example`)
- `REDIS_PORT`, `REDIS_URL`
- Outras (ex.: `JWT_SECRET`, `SENTRY_DSN`) conforme necessidade

## Executando com Docker (recomendado)
Pré-requisitos: Docker e Docker Compose.

1) Copie o exemplo de env e ajuste valores:
```bash
cp env.example .env
```

2) Desenvolvimento (hot-reload):
```bash
docker compose up -d --build
# Logs
docker compose logs -f app | cat
```
- App: `http://localhost:${PORT:-4000}/api`
- Docs: `http://localhost:${PORT:-4000}/api/docs`

3) Produção (imagem otimizada):
```bash
docker compose -f docker-compose.prod.yaml up -d --build
# Logs
docker compose -f docker-compose.prod.yaml logs -f app | cat
```

## Executando localmente com Bun (sem Docker)
Pré-requisitos: Bun 1.x, PostgreSQL e Redis disponíveis.
```bash
bun install
bunx prisma generate
bun run build
bun run start          # ou: bun run start:dev (watch)
```
Certifique-se de que `DATABASE_URL` e `REDIS_URL` estejam válidas no ambiente.

## Scripts (package.json)
- `start`: inicia a API
- `start:dev`: inicia em modo watch (desenvolvimento)
- `build`: compila TypeScript para `dist/`
- `lint` / `lint:fix`: checagem e correção de lint
- `test`, `test:cov`, `test:e2e`, `test:unit`: suíte de testes
- `seed`: executa seeds do Prisma

Exemplos:
```bash
bun run lint
bun run test:cov
bun run seed
```

## Banco de dados e Prisma
- Modelo: `prisma/schema.prisma`
- Gerar cliente: `bunx prisma generate`
- Aplicar migrations (o Docker executa `migrate deploy` ao subir):
```bash
# Local
bunx prisma migrate deploy
# Docker
docker compose exec app bunx prisma migrate deploy
```
- Seeds:
```bash
docker compose exec app bun run seed
```

## Troubleshooting
- Porta em uso: ajuste `PORT` no `.env`
- DB/Redis indisponíveis: verifique containers `db` e `redis` e variáveis `DATABASE_URL`/`REDIS_URL`
- Prisma Client desatualizado: `bunx prisma generate`
- Migrations pendentes: `bunx prisma migrate deploy`

## Licença
Uso interno/privado (`UNLICENSED`).
