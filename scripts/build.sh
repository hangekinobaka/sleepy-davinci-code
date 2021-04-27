# bin/bash

docker-compose --env-file ./env/.env.build -f ./docker-compose-build.yml build   
docker image prune -f