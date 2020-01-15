# Mix

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.3.

## Deployment

The deployment process is done through GitLab CI in these steps:

Run `ng serve --aot --host 0.0.0.0 --disable-host-check` to serve it with AOT Compiler and public to all clients in main folder (not in subfolder!). If you receive errors compiling, try running the command inside code command-shell.

## Service Worker Status

https://angular.io/guide/service-worker-communications

## Code scaffolding

## Container configuration

The configuration files of the mix front are located in ```/mix-pwa```, there you have 3 main files:

* ```nginx.conf``` · stores the main nginx configuration, like ports and gzip
* ```default.conf``` · stores the main website
* ```docker-compose.yml``` · stores the docker containers building definition, where the previous files are linked in

Use ```docker-compose up -d``` to build the container and its volumes.   
