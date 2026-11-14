#!/bin/bash
cd /home/user/wt/2-1-grips
for i in $(seq 1 ${1:-8}); do
  for v in ${2:-grips nogrips}; do
    cp -r .probe/dist-$v/. canvas/dist/
    node --test --test-timeout=120000 --test-name-pattern="pan step|drag step" canvas/app/test/scale.test.mjs > .probe/runs/pan-$v-$i.txt 2>&1
  done
done
cp -r .probe/dist-grips/. canvas/dist/
