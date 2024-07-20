FROM node:current-slim

WORKDIR /app

COPY ./ /app

RUN npm install

ENTRYPOINT ["node", "./readme2notion.js"]