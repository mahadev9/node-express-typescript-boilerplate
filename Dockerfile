FROM node:alpine

RUN mkdir -p /app && chown -R node:node /app

WORKDIR /app

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 3000
