# Kliiko
Tested on: Node version 4.2.1 LTS, NPM version 3.3.8

## Dependencies

NodeJs 4.2.x

NPM 3.3.x

MySQL 5.7

Redis 3.0.5

[ImageMagick](http://www.imagemagick.org/)

## Set up Project

```sh
 cd project_path
 npm install
```

1) Copy  ```./config/config.json.sample``` to  ``` ./config/config.json```

2) Need create databases with names from ``` ./config/config.json```

3) Need run migrations
```sh
  node node_modules/.bin/sequelize
```

### Database ORM

Use [Sequelize](http://docs.sequelizejs.com/en/latest/)

Use [Sequelize Migrations ](http://docs.sequelizejs.com/en/latest/docs/migrations/)

### Run Gulp

Run commands in terminal:

1) ``` npm install gulp -g```

2) ``` npm install ```  (in project folder)

3) ``` gulp ``` ( if some dependenices are missing, please install them by hand for example npm install --save-dev gulp-image)

4) New folder will be created "build" , gulp run front end and back end and does many tasks as concatenation,
  minification and a lot of other staff.

### Run Tests
 ```sh
 npm install mocha -g
 mocha test
 ```
