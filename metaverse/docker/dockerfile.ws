FROM node:20-alpine AS base

ARG VITE_JWT_SECRET
ARG VITE_BACKEND_URL
ARG VITE_WS_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_CLIENT_SECRET
ARG DATABASE_URL
ARG FRONTEND_URL

ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_GOOGLE_CLIENT_SECRET=${VITE_GOOGLE_CLIENT_SECRET}
ENV VITE_JWT_SECRET=${VITE_JWT_SECRET}
ENV DATABASE_URL=${DATABASE_URL}
ENV FRONTEND_URL=${FRONTEND_URL}

RUN apk add --no-cache openssl
RUN apk add --no-cache netcat-openbsd

WORKDIR /app    

COPY metaverse/package.json ./
COPY metaverse/turbo.json ./
COPY metaverse/packages/ui/package.json ./packages/ui/
COPY metaverse/packages/db/package.json ./packages/db/
COPY metaverse/apps/frontend/package.json ./apps/frontend/
COPY metaverse/apps/ws/package.json ./apps/ws/
COPY metaverse/apps/http/package.json ./apps/http/


# Install dependencies
RUN npm install

COPY metaverse/apps/ws ./apps/ws
COPY metaverse/packages/db ./packages/db

RUN npm run db:generate

RUN cd apps/ws && npm run build && cd ../..


EXPOSE 8081

CMD ["npm", "run", "start-ws"]