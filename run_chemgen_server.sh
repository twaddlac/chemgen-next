#!/usr/bin/env bash

source chemgen_docker_vars.sh

docker-compose stop
docker-compose rm -f -v
docker-compose up -d --build

#cd chemgen-next-server
#pm2 start server/server.js --name chemgen-dev -i 2 --watch -f
#cd ../chemgen-next-client
#pm2 start  --name chemgen-dev-ng --watch -f
