FROM node:12.14-alpine3.11

RUN apk add --no-cache bash

RUN npm install

RUN npm install -g @nestjs/cli

RUN apk-install bash

USER node

WORKDIR /home/node/app