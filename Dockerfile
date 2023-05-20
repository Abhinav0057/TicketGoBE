FROM node:16.17.0

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

EXPOSE 5000
CMD [ "yarn", "start" ]