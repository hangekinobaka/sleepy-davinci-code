# bin/bash

docker-compose down
docker pull hangekinobaka/dvc-app-client:1.0.0
docker pull hangekinobaka/dvc-app-server:1.0.0
docker-compose up -d --build
docker image prune -f