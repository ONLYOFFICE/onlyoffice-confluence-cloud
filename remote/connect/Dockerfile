FROM node:18-alpine AS confluence-cloud
LABEL maintainer="Ascensio System SIA <support@onlyoffice.com>"

ARG NODE_ENV=production
ARG AC_OPTS=no_reg
ARG PORT=3000
ENV NODE_ENV=$NODE_ENV \
    AC_OPTS=$AC_OPTS \
    PORT=$PORT

WORKDIR /usr/src/app

RUN apk update \
    && apk --no-cache add git

COPY ./package*.json ./
RUN npm install --also=dev

COPY . .
RUN git submodule update --init --recursive
RUN npm run build

RUN npm ci

EXPOSE $PORT
CMD [ "npm", "start" ]
