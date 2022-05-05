FROM node:16-alpine as base

COPY . /hardhat
WORKDIR /hardhat
COPY package*.json ./
RUN apk --no-cache --virtual build-dependencies add python3 make g++ bash git
RUN npm install

EXPOSE 8545
