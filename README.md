
# Kliiko
Tested on: Node.js version 4.2.x LTS, NPM version 3.3.x

## Dependencies

Node.js >= 5.11.x

Express 4.14.x

NPM 3.8.x

PostgreSQL 9.5.x

Redis 3.2.x

[ImageMagick](http://www.imagemagick.org/)

## Set up Project

```sh
 cd project_path
 npm install
```

1) Copy  ```sample.env``` to  ``` .env```

2) Change database URL environment variables in .env file ```DATABASE_NAME_* DATABASE_USER_* DATABASE_PASSWORD_* DATABASE_HOST_* DATABASE_DIALECT_*``` to corresponding databases

3) Run migrations in order to sycnhronize database
```sh
  npm run migrations
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
``` npm run reset ```

To run seeds for user run this command: ``` node seeders/users.js ```
To run seeds for chat session run this command: ``` node seeders/chatSession.js ```
To run seeds for email template editor run this command: ``` node seeders/mailTemplates.js ```

Default user credentials email ``` admin@insider.com ``` or ``` user@insider.com ``` and password ``` qwerty123 ```

## Run Gulp

Run commands in terminal:

1) RUN GULP   ``` npm run gulp ```

2) Open browser: ``` http://insider.focus.com:8080/ ```


### Tests
Install mocha ```  npm install mocha -g ```

 Run

 ``` mocha test```

 or

 ``` npm test ```

### Debugging
If need uses debugger the gulp should be installed globally ``` npm install gulp -g```

 1) Run Gulp with --debug argument ```gulp --debug ```

 2) Open Chrome or Opera and go to http://127.0.0.1:8085/?ws=127.0.0.1:8085&port=5858


### Migrations

Example

```js
  'use strict';
  let Bluebird = require('bluebird');
  let validateError = require('./helpers/errorFilter.js').validateError

  module.exports = {
    up: function (queryInterface, Sequelize) {
      return new Bluebird(function (resolve, reject) {
        queryInterface.addColumn('Sessions', 'type', { type: Sequelize.ENUM, values: ['focus', 'forum'] }).then(function() {
          resolve();
        },function(error) {
          validateError(error, resolve, reject);
        });
    });
    },
    down: function (queryInterface, Sequelize) {
      return queryInterface.removeColumn('Sessions', 'type');
    }
  };

```
