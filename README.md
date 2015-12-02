# Kliiko
Tested on: Node.js version 4.2.x LTS, NPM version 3.3.x

## Dependencies

Node.js >= 4.2.x

Express 4.1.x

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

2) Create databases with the names from ``` ./config/config.json```

3) Run migrations in order to sycnhronize database
```sh
  node node_modules/.bin/sequelize  db:migrate
```
##  Subdomain setup

### Linux

Need modify ``` /etc/hosts ``` with ``` 127.0.0.1 insider.focus.com```
If needed use specific subdomain name for users then ``` 127.0.0.1 acountName.focus.com ```

### WINDOWS

1) you must have admin permissions

2) go to `C:\Windows\System32\drivers\etc`

3) add next lines to `hosts` file      
    127.0.0.1     insider.focus.com      
    127.0.0.1     www.insider.focus.com      
    127.0.0.1     user.focus.com      
    127.0.0.1     www.user.focus.com      

4) remove localhost

Also you required to have Python 2.7.x and Visual Studio as C compiler.

## Database migrations and ORM

In the project we use ORM [Sequelize](http://docs.sequelizejs.com/en/latest/)

Also we use code-first migrations [Sequelize Migrations ](http://docs.sequelizejs.com/en/latest/docs/migrations/)

To restart DB, delete and recreate all tables based on the models, run this command from root directory of the project:
``` node lib/tasks/db_reset.js ```

To run user seeds run this command: ``` node seeders/users.js ```

Default user credentials email ``` admin@insider.com ``` or ``` user@insider.com ``` and password ``` qwerty123 ```

## Run Gulp

Run commands in terminal:

1) ``` npm install gulp -g```

2) ``` npm install ```  

3) RUN GULP   ``` gulp ```

4) Open browser: ``` http://insider.focus.com:3000/ ```


### Tests
Install mocha ```  npm install mocha -g ```

 Run

 ``` mocha test```

 or

 ``` npm test ```

### Debugging

 1) Run Gulp with --debug argument ```gulp --debug ```

 2) Open Chrome or Opera and go to http://127.0.0.1:8085/?ws=127.0.0.1:8085&port=5858
