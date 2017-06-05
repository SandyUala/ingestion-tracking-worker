FROM node:8.0.0-alpine

MAINTAINER Alois Barreras <alois@astronomer.io>

# Install java for the kcl
RUN apk --update add openjdk7-jre

RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/log

# Bundle app source
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
RUN npm install --production

COPY lib /usr/src/app/lib
COPY properties /usr/src/app/properties

CMD ["npm", "run", "dev"]
