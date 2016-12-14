# Kliiko

## Dependencies

  * Node.js 6.9.x LTS
  * NPM 3.10.x
  * PostgreSQL 9.5.x
  * Redis 3.x.x
  * Python 2.7.x
  * [ImageMagick](http://www.imagemagick.org/)

## Set up Project

1) Copy ``` example.env ```  to  ``` .env ```.

2) Change database variables in ``` .env ``` and change with necessary database credentials.

3) Run ``` npm install ``` in project directory to install packages.

4) Run ``` npm run reset ``` in project directory to reset database.
Use ``` npm run migrations ``` to run migrations.

### Windows

Run in PowerShell to update NPM to lasted version
```
Set-ExecutionPolicy Unrestricted -Scope CurrentUser -Force
npm-windows-upgrade
```

[Redis 3.x](https://github.com/ServiceStack/redis-windows/tree/master/downloads)

For Python install set option to include PATH value.

Also you required to have Visual Studio as C compiler.

Restart Windows when all installed.

##  Subdomain setup

### Linux

Need modify ``` /etc/hosts ``` with ``` 127.0.0.1 insider.focus.com ```.
If needed use specific subdomain name for users then ``` 127.0.0.1 acountName.focus.com ```.

### Windows

Go to ``` C:\Windows\System32\drivers\etc ```
and add next lines to ``` hosts ``` file
```     
    127.0.0.1     insider.focus.com
    127.0.0.1     www.insider.focus.com
    127.0.0.1     user.focus.com
    127.0.0.1     www.user.focus.com    
    127.0.0.1     admin.focus.com      
    127.0.0.1     www.admin.focus.com  
```   

## Database migrations and ORM

In the project we use ORM [Sequelize](http://docs.sequelizejs.com/en/latest/)

Also we use code-first migrations [Sequelize Migrations](http://docs.sequelizejs.com/en/latest/docs/migrations/)

To restart DB, delete and recreate all tables based on the models, run this command from root directory of the project:
``` npm run reset ```

To run seeds for user run this command: ``` node seeders/users.js ```
To run seeds for chat session run this command: ``` node seeders/chatSession.js ```
To run seeds for email template editor run this command: ``` node seeders/mailTemplates.js ```

Default user credentials email ``` admin@insider.com ``` or ``` user@insider.com ``` and password ``` qwerty123 ```

## Run project

1) Run GULP ``` npm run gulp ```

2) Open browser: ``` http://insider.focus.com:8080/ ```

## Live update Socket server
To use live events in dashboard need start elixir server

### Tests
Run

 ``` mocha test```
or
 ``` npm test ```

### Debugging
If need uses debugger the gulp should be installed globally ``` npm install gulp -g```

 1) Run Gulp with --debug argument ```gulp --debug ```

 2) Open browser and go to http://127.0.0.1:8085/?ws=127.0.0.1:8085&port=5858


## Migrations

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
