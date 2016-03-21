FROM node:argon

RUN apt-get install libstdc++6

RUN mkdir -p /var/www/klzii
WORKDIR /var/www/klzii

COPY package.json /var/www/klzii

COPY config/config.json.sample config/config.json

COPY . /var/www/klzii

RUN npm install



EXPOSE 3000
CMD NODE_ENV=production node node_modules/gulp/bin/gulp.js

