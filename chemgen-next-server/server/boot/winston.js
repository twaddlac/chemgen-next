'use strict'

module.exports = function (app, cb) {
  let winston = require('winston')
  winston.cli()

  let logger = new winston.Logger({
    transports: [
      new (winston.transports.Console)()
    ]
  })

  logger.cli()
  app.winston = winston

  process.nextTick(cb)
}
