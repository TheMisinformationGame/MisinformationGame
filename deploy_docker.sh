#!/bin/bash

docker build -t misinfogame .
docker run -it misinfogame ./deploy.sh --docker
