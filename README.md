## Server Side Code
Server side code is written in Node.js using Loopback.

## Client Side Code and Interfaces
Client Side code is written using Angular6, and is then ported over to a wordpress app

In order to build the latest client side code and add it to the wordpress app

```
cd chemgen-next-client
ng build --prod  --output-hashing none --output-path ../chemgen-next-wptheme/js/ng
```

## Bringing up the docker sev servers

Included is a set of docker compose configurations to bring up all services using docker.
There is no data persistance and this is meant for DEV USE ONLY.

Running  `./run_chemgen_server.sh` will bring up the docker compose instance.

The dev servers do not have any experimental data, only the configurations. In order to load experimental data you will need to process 1 or more screens. take a look at the jobs/processQueues.js script to see some options for searching for workflow configurations.

```
source chemgen_docker_vars.sh
cd chemgen-next-server
## See the one time setup to install pm2
pm2 jobs/defineQueues.js --name chemgen-next-define-queues
## TODO Add in a dev script just to load some data
node jobs/processQueues.js
```

If you want to ensure you have a clean startup 

```
docker-compose stop
docker-compose rm -f -v
docker-compose up --build -d
```

If for some reason you want to empty the wordpress database and startup info:

```
docker volume rm chemgen-next-web-docker_wordpress_db_data
```

### One time startup instructions

#### Bring up the node server

I am having trouble getting these working as docker containers, so for now you have to do it the hard way. First ensure you have node.js>=9.

```
npm install -g pm2 @angular/cli nodemon
```

To start the loopback server

```
cd chemgen-next-server
## Run in the foreground
nodemon server/server.js
## Run in the background
pm2 start server/server.js --name chemgen-next-server --watch
```

To start the angular dev server

```
cd chemgen-next-client
ng serve --bind 0.0.0.0
```

#### Wordpress

If it is your first time running this you will need to visit localhost:8000 in order to do the initial wordpress install (for now).

Once it is installed you will also need to create a page for the angular app to live on.

In the wordpress console go to 'Create New Page', and create a page called 'App' with the permalink 'app' and from the Template 'ChemGenAngularApp' 

### Analysis Modules

#### Tensorflow Counts

The docker configuration in chemgen-next-analysis-docker requires some data files that are too big for github and will need to be hosted somewhere. You can get the most recent version on the cloud with `        docker pull quay.io/nyuad_cgsb/tf_14_faster_rcnn_inception_resnet_v2_atrous_coco_tf_counts:latest`

#### Devstar Counts

The configuration is all here, but since devstar is a private github repo you will need to go and download the repo as a zip and put it in the chemgen-next-analysis-docker/counts/devstar folder.
