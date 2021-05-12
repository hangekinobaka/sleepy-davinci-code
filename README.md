# Sleepy Davinci Code Game

- [Sleepy Davinci Code Game](#sleepy-davinci-code-game)
  - [Links](#links)
  - [Game Preview](#game-preview)
  - [Local Develop and Remote Deploy Structure](#local-develop-and-remote-deploy-structure)
  - [Application Logic Structure](#application-logic-structure)
  - [Data Flow](#data-flow)
  - [Game Description](#game-description)
  - [Dev Env](#dev-env)
    - [Docker command](#docker-command)
    - [Default dev urls](#default-dev-urls)
  - [Prod Command](#prod-command)

![](img/board-game.jpg)   

## Links
[![](https://github.com/hangekinobaka/sleepy-davinci-code/actions/workflows/release.yml/badge.svg)](https://github.com/hangekinobaka/sleepy-davinci-code/releases)      
[![](https://img.shields.io/static/v1?label=DEMO&message=https://dvc.sleepystudio.ga&color=blue)](https://dvc.sleepystudio.ga)   

## Game Preview

![](img/dvc-preview.png)

## Local Develop and Remote Deploy Structure

![](design/sleepy-dvc-deploy-structure.png)

## Application Logic Structure

![](design/dvc-app-logic.png)    

## Data Flow

![](design/data-flow.png)
## Game Description

Reveal all of your opponent's secret code before they crack yours!

## Dev Env

### Docker command

---
Start dev env

Two ways
1. Copy the dev file
    ```
    cp ./docker-compose-dev.yml  ./docker-compose.yml

    cp .env/.env.default  ./.env
    ```
    
    Run
    ```
    docker-compose up -d
    ```
    to start dev server

2. Run
    ```
    docker-compose -f ./docker-compose-dev.yml up -d
    ```
    to start dev server  

**Follwing commands are based on the first method:**  

Rebuild image
```
docker-compose up --build -d
```
 
Stop docker
```
docker-compose down
```

Access redis container  
```
docker exec -ti redis_cache sh
```
- Start redis interaction
  ```
  redis-cli

  /data # redis-cli
  127.0.0.1:6379>
  ```
- Set value
  ```
  set [KEY] [VAL] EX 60
  ```
- Get value
  ```
  get [KEY]
  ```

### Default dev urls

---
- client   
  http://localhost:3000/   

- server   
  http://localhost:5000/   

- redis commander   
  http://localhost:8081/     

  username/password: admin/admin

## Prod Command

Just Build
```
docker-compose -f ./docker-compose-build.yml build
```

Start prod env as a local test
```
docker-compose -f ./docker-compose-prod.yml up -d --build
```
