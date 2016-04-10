FROM node:argon

RUN apt-get install libstdc++6

RUN mkdir -p /var/www/klzii
WORKDIR /var/www/klzii

COPY package.json /var/www/klzii

COPY . /var/www/klzii

RUN npm install --production --quiet

EXPOSE 8080

CMD NODE_ENV=production npm run start

