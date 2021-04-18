# bin/bash

docker-compose -f ./docker/docker-compose/docker-compose-prod.yml build
docker push hangekinobaka/dvc-app-server:0.0.1