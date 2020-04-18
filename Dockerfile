FROM node:12-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./src/ /usr/src/app/

RUN npm install

EXPOSE 3000

CMD npm start
