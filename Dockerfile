RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" >> /etc/apt/sources.list.d/yarn.list
RUN echo "deb http://archive.debian.org/debian/ wheezy main contrib non-free" >> /etc/apt/sources.list.d/archive.list

RUN apt-get update && apt-get dist-upgrade -y
RUN apt-get install -y vim net-tools yarn --force-yes

WORKDIR /var/www/klzii

COPY . /var/www/klzii
EXPOSE 8080

RUN yarn install

RUN yarn run build_prod
