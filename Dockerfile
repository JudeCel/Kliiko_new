FROM node:argon

RUN mkdir -p /var/www/klzii
WORKDIR /var/www/klzii

COPY package.json /var/www/klzii

COPY . /var/www/klzii

RUN rm -r node_modules

RUN npm install

EXPOSE 3000
CMD [ "gulp"]
