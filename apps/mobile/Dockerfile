FROM node:20-bullseye
RUN apt-get update && apt-get install -y --no-install-recommends \
    git wget unzip python3 python3-pip build-essential \
    ca-certificates watchman && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then yarn install; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install; \
    else npm install; fi
COPY . .
EXPOSE 8081 19000 19001 19002 19006
CMD ["npm","start"]
