#!/bin/bash

if [[ "$OSTYPE" != "darwin"* ]]; then 
  export UID
fi

docker-compose up


