FROM node:20-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend frontend
COPY libs/template-meta libs/template-meta

RUN pnpm install --filter @aged-template/web...

CMD ["pnpm", "--filter", "@aged-template/web", "exec", "vite", "--host", "0.0.0.0", "--port", "5173"]
