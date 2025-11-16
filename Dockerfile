FROM node:20-alpine

WORKDIR /server

COPY package*.json ./

RUN npm install

RUN apk add --no-cache dcron sqlite

COPY . .

RUN chmod +x /server/docker-entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production \
    SATNOGS_API_BASE_URL="https://db.satnogs.org/api/satellites" \
    SATNOGS_API_TIMEOUT_MS=5000

CMD ["/server/docker-entrypoint.sh"]
