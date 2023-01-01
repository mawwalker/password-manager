#!/bin/bash
app="password-mg"
docker build -t ${app} .
docker run -d \
  --name=${app} \
  -v $PWD:/app ${app}
