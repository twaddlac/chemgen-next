var app = require('../../server/server');
var agenda = require('../agenda');
agenda.define('ExpScreenUploadWorkflow.doWork', function (job, done) {
    console.log('In agenda do work!!!');
    app.models.ExpScreenUploadWorkflow.load.workflows.doWork(job.attrs.data.workflowData)
        .then(function () {
        done();
    })
        .catch(function (error) {
        done(new Error(error));
    });
});
// Not Sure that I will end up using this one
// Will probably just stick the whole in using the experiment doWork
agenda.define('ExpAssay.load.workflows.processExpPlate', function (job, done) {
    app.models.ExpAssay.load.workflows.processExpPlate(job.attrs.data.workflowData, job.attrs.data.expPlate)
        .then(function (results) {
        done();
    })
        .catch(function (error) {
        done(new Error(error));
    });
});
//# sourceMappingURL=ExpScreenUploadWorkflow.js.map