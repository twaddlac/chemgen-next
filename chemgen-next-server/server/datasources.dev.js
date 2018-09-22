'use strict'

// The dev datasource uses the docker compose instance to bootstrap the mysql and mongodb data with librarydata
// There is NO experimental data in there unless you put it!

module.exports = {
  db: {
    name: 'db',
    connector: 'memory'
  },
  arrayscanDS: {
    name: 'arrayscanDS',
    connector: 'mysql',
    port: 3307,
    database: 'arrayscan',
    host: 'localhost',
    user: 'root',
    password: 'password',
  },
  chemgenDS: {
    name: 'chemgenDS',
    connector: 'mysql',
    host: 'localhost',
    port: 3308,
    database: 'chemgen-next-dev',
    user: 'root',
    password: 'password',
  },
  wordpressDS: {
    name: 'wordpressDS',
    connector: 'mysql',
    host: 'localhost',
    port: 3309,
    database: 'wordpress',
    password: 'password',
    user: 'wordpress'
  },
  mongoDB: {
    name: 'mongoDB',
    connector: 'mongodb',
    port: 27017,
    // host: 'localhost',
    // url: 'mongodb://root:password@localhost/chemgen',
    //mongodb on docker needs the authdb
    url: 'mongodb://root:password@localhost:27017/chemgen?authSource=admin',
    // database: 'chemgen',
    // user: 'root',
    // password: 'password',
  }
}
