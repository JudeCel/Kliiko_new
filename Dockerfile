FROM node:6.14.1-stretch



RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" >> /etc/apt/sources.list.d/yarn.list

RUN apt-get update
RUN apt-get install -y apt-transport-https
RUN apt-get dist-upgrade -y
RUN apt-get install -y vim net-tools yarn --force-yes

WORKDIR /var/www/klzii

COPY . /var/www/klzii
EXPOSE 8080

RUN yarn install

RUN yarn run build_prod
