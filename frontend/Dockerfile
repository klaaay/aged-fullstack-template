FROM node:20-alpine AS base

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend frontend
COPY libs/template-meta libs/template-meta

RUN pnpm install --filter @aged-template/web...

FROM base AS dev

CMD ["pnpm", "--filter", "@aged-template/web", "exec", "vite", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN pnpm --filter @aged-template/web build

FROM nginx:1.27-alpine AS prod

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html
