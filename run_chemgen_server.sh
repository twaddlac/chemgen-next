#!/usr/bin/env bash

source chemgen_docker_vars.sh

docker-compose stop
## If you want to ensure all hte containers are empty
#docker-compose rm -f -v
docker-compose up -d --build

