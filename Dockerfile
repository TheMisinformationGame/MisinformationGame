FROM node:20-slim AS base

FROM base AS base-deps
WORKDIR /app
RUN apt-get update \
    && apt-get install -y \
        ca-certificates \
        curl \
        python3 \
        libkrb5-3 \
        libkrb5-dev \
        build-essential \
        libssl-dev \
    && rm -rf /var/lib/apt/lists/*

FROM base-deps as build-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN npm install -g firebase-tools
RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache

FROM base-deps as builder
WORKDIR /app
COPY --from=build-deps /app/node_modules ./node_modules
COPY . .
