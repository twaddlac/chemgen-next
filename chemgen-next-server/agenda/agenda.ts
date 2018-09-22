import Agenda = require('agenda');

const mongoConnectionString = 'mongodb://admin:admin123@onyx.abudhabi.nyu.edu/agenda';
import app = require('../server/server');

let agenda = new Agenda({
  defaultConcurrency: 5,
  maxConcurrency: 100,
  db: {
    address: mongoConnectionString,
  },
});

agenda.on('start', function (job) {
  console.log('Job %s starting', job.attrs.name);
});

agenda.on('error', function (error) {
  console.log('We got an error! ' + JSON.stringify(error));
});

agenda.define('testJob', function (job) {
  console.log('There is a testJob ' + JSON.stringify(job.attr.data, null, 2))
});

agenda.define('ExpScreenUploadWorkflow.doWork', function (job, done) {
  app.models.ExpScreenUploadWorkflow.load.workflows.doWork(job.attrs.data.workflowData)
    .then(() => {
      done();
    })
    .catch((error) => {
      done(new Error(error));
    });
});

// require('./jobs/jobs.js')(agenda);

agenda.on('ready', function () {
  // console.log('Agenda ready!');
  //TODO set this up as a separate worker script
  // agenda.processEvery('2 seconds');
  // agenda.maxConcurrency(100);
  // agenda.defaultConcurrency(20);
  // agenda.start();
});

agenda.on('complete', function (job) {
  // console.log('Job %s finished', job.attrs.name);
  job.remove(function (err) {
    if (err) {
      console.log('there was a problem removing job ' + err);
    }
  });
});

function graceful() {
  agenda.stop(function () {
    process.exit(0);
  });
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

export = agenda;
