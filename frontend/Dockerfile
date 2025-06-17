FROM node:20 AS build

WORKDIR /opt/app

COPY package*.json ./

RUN npm install
RUN npm install lightningcss --ignore-platform

COPY ./ .

ENV PORT=3000

EXPOSE $PORT

CMD ["npm", "run", "dev"]