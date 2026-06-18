# syntax=docker/dockerfile:1

### ---------- build frontend ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

### ---------- nginx ----------
FROM nginx:1.27-alpine

# 정적 프론트엔드
COPY --from=build /app/dist /usr/share/nginx/html

# envsubst로 ${DOMAIN}이 채워지는 설정 템플릿
COPY nginx/templates/ /etc/nginx/templates/

EXPOSE 80 443
