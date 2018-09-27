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

The dev servers do not have any experimental data, only the configurations. In order to load experimental data you will need to process 1 or more screens.

```
cd chemgen-next-server
nohup node jobs/defineQueues.js
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

If it is your first time running this you will need to visit localhost:8000 in order to do the initial wordpress install.

Once it is installed you will also need to create a page for the angular app to live on.

In the wordpress console go to 'Create New Page', and create a page called 'App' with the permalink 'app' and from the Template 'ChemGenAngularApp' 
