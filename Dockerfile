FROM node:5.11.0-wheezy

WORKDIR /var/www/klzii

COPY . /var/www/klzii

RUN npm install --quiet && \
    ./node_modules/gulp/bin/gulp.js build-prod

EXPOSE 8080

CMD NODE_ENV=production npm run start_pm2
