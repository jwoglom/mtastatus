#!/bin/bash

if [[ "$REACT_APP_MTASTATUS_ENDPOINT" == "" ]]; then
  echo "Error: Set REACT_APP_MTASTATUS_ENDPOINT"
  exit -1
fi

REACT_APP_MTASTATUS_ENDPOINT_=${REACT_APP_MTASTATUS_ENDPOINT}

mv build/.git build.git
source .env
REACT_APP_MTASTATUS_ENDPOINT=${REACT_APP_MTASTATUS_ENDPOINT_}
REACT_APP_MTASTATUS_HOME_STATIONS=$REACT_APP_MTASTATUS_HOME_STATIONS REACT_APP_MTASTATUS_ENDPOINT=$REACT_APP_MTASTATUS_ENDPOINT npm run build
mv build.git build/.git
(cd build && git add -A && git commit -m "build $(date)")

(cd build && git status && echo "Push?" && read && git push)
