# bin/bash

docker pull hangekinobaka/dvc-app-client:0.0.1
docker pull hangekinobaka/dvc-app-server:0.0.1
docker-compose up -d --build
docker image prune -f