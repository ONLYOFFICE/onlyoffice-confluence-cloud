FROM node:16-alpine AS confluence-cloud
LABEL maintainer Ascensio System SIA <support@onlyoffice.com>
ARG NODE_ENV=production
ARG AC_OPTS=no_reg
ARG PORT=3000
ENV NODE_ENV=$NODE_ENV \
    AC_OPTS=$AC_OPTS \
    PORT=$PORT
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install
COPY . .
EXPOSE $PORT
CMD [ "npm", "start" ]
