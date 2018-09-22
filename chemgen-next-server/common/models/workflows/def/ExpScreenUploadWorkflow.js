'use strict'
const Promise = require('bluebird')
const app = require('../../../../server/server')

module.exports = function (ExpScreenUploadWorkflow) {
  ExpScreenUploadWorkflow.load = {}
  ExpScreenUploadWorkflow.load.workflows = {}
  ExpScreenUploadWorkflow.load.workflows.worms = {}
  ExpScreenUploadWorkflow.load.workflows.worms.primary = {}
  ExpScreenUploadWorkflow.load.workflows.worms.secondary = {}
  ExpScreenUploadWorkflow.load.workflows.primary = {}
  ExpScreenUploadWorkflow.load.workflows.secondary = {}


  ExpScreenUploadWorkflow.load.primary = {}
  ExpScreenUploadWorkflow.load.secondary = {}


  ExpScreenUploadWorkflow.on('attached', function () {
    require('../load/ExpScreenUploadWorkflow')
    require('../experiment/worms/load/primary/ExpScreenUploadWorkflow')
    require('../experiment/worms/load/ExpScreenUploadWorkflow')
  })

  ExpScreenUploadWorkflow.doWork = function (workflowData) {
    return new Promise((resolve, reject) => {
      // ExpScreenUploadWorkflow.load.workflows.worms.primary.doWork
      // app.winston.info(JSON.stringify(workflowData, null, 2))
      app.winston.info(`ExpScreenUploadWorkflow.doWork ${workflowData.name}`);
      app.agenda.now('ExpScreenUploadWorkflow.doWork', {workflowData: workflowData})
      resolve({'status': 'ok'})
    })
  }

  ExpScreenUploadWorkflow.remoteMethod(
    'doWork', {
      http: {path: '/dowork', verb: 'post'},
      accepts: {arg: 'workflowData', type: 'any', http: {source: 'query'}},
      returns: {arg: 'status', type: 'string'}
    }
  )
}
