FROM node:6.6.0-wheezy

RUN apt-get update && apt-get dist-upgrade -y \
&& apt-get install -y vim net-tools

WORKDIR /var/www/klzii

COPY . /var/www/klzii

RUN npm install --quiet
RUN npm run build_prod

EXPOSE 8080

CMD NODE_ENV=production npm run migrations
CMD NODE_ENV=production npm run start_pm2 && npm run pm2_logs
