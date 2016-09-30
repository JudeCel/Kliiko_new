FROM node:6.6.0-wheezy

RUN apt-get update && apt-get dist-upgrade -y \
&& apt-get install -y vim net-tools

WORKDIR /var/www/klzii

COPY . /var/www/klzii
EXPOSE 8080

CMD ['./production_start.sh']
