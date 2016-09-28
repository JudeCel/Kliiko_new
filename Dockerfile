FROM node:6.3.1-wheezy

RUN apt-get update && apt-get dist-upgrade -y \
&& apt-get install -y vim netstat

WORKDIR /var/www/klzii

COPY . /var/www/klzii

RUN npm install --quiet && \
    ./node_modules/gulp/bin/gulp.js build-prod

EXPOSE 8080

CMD NODE_ENV=production npm run migrations
CMD NODE_ENV=production npm run start_pm2 && npm run pm2_logs
