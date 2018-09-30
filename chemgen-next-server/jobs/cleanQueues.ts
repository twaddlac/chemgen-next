import app = require('../server/server');
import jobQs = require('./defineQueues');
import redis = require('redis');
import config = require('config');

const redisClient = redis.createClient(config.get('redisUrl'));

redisClient.flushdb( function (err, succeeded) {
  console.log(`Success flushdb: ${succeeded}`);
  if(err){
    console.log(`Error: ${err}`);
  }
});

redisClient.flushall( function (err, succeeded) {
  console.log(`Success flushall: ${succeeded}`);
  if(err){
    console.log(`Error: ${err}`);
  }
});

Object.keys(jobQs).map((queue) =>{
  console.log(queue);
  //@ts-ignore
  jobQs[queue].clean(0, 'delayed');
  //@ts-ignore
  jobQs[queue].clean(0, 'active');
  //@ts-ignore
  jobQs[queue].clean(0, 'completed');
  //@ts-ignore
  jobQs[queue].clean(0, 'failed');

  //@ts-ignore
  jobQs[queue].empty()
    .then(() => {
      console.log(`Cleaned the queues!`);
    })
    .catch((error) =>{
      console.log(`Error: ${error}`);
    });
});
