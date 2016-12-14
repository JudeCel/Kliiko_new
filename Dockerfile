FROM node:6.9.1-wheezy

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" >> /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get dist-upgrade -y
RUN apt-get install -y vim net-tools yarn

WORKDIR /var/www/klzii

COPY . /var/www/klzii
EXPOSE 8080

RUN yarn install

RUN npm run build_prod
