#!/bin/bash

mv build/.git build.git
REACT_APP_MTASTATUS_ENDPOINT= npm run build
mv build.git build/.git
(cd build && git add -A && git commit -m "build $(date)")

(cd build && git status && echo "Push?" && git push)
