import agenda = require('../agenda/agenda');
import cluster = require('cluster');

const instances = 2;
const numCPUs = require('os').cpus().length;

agenda.define('testJob', function (job) {
  console.log('There is a testJob ' + JSON.stringify(job.attr.data, null, 2));
});

agenda.on('start', function (job) {
  console.log('Job %s starting', job.attrs.name);
  console.log(JSON.stringify(job.attrs.data));
});

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  console.log(`Worker ${process.pid} started`);
  startAgenda();
}

function startAgenda() {
  agenda.on('ready', function () {
    agenda.processEvery('2 seconds');
    agenda.start();
    agenda.now('testJob', {
      hello: 'world', thing1: function hello() {
      }
    });
    console.log('agenda started...');
  });
}
