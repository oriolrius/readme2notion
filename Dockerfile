#FROM node:current-slim
FROM node:22-alpine

WORKDIR /app

COPY ./ /app

RUN npm install

ENTRYPOINT ["node", "./readme2notion.js"]