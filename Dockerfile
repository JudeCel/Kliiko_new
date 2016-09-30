FROM node:6.6.0-wheezy

RUN apt-get update && apt-get dist-upgrade -y \
&& apt-get install -y vim net-tools

WORKDIR /var/www/klzii

COPY . /var/www/klzii
EXPOSE 8080

ENV NODE_ENV production

RUN npm install --quiet
RUN npm run build_prod
RUN npm run migrations
RUN npm run start_pm2
RUN npm run pm2_logs
