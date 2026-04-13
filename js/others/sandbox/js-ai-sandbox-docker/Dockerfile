FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY mcp/files-mcp/package.json mcp/files-mcp/package-lock.json ./mcp/files-mcp/
RUN npm ci --prefix mcp/files-mcp

COPY tsconfig.json config.json ./
COPY src ./src
COPY mcp/files-mcp/tsconfig.json ./mcp/files-mcp/
COPY mcp/files-mcp/src ./mcp/files-mcp/src

RUN npm run build:mcp && npm run build

RUN mkdir -p logs && chown -R node:node /app

USER node

CMD ["node", "-r", "dotenv/config", "dist/index.js"]
