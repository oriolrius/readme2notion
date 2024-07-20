#FROM node:current-slim
FROM node:current-alpine

WORKDIR /app

COPY *js /app
COPY *json /app

RUN npm install

WORKDIR /repos

ENTRYPOINT ["node", "/app/readme2notion.js"]
