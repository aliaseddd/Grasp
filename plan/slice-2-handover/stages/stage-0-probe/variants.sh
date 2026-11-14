#!/bin/bash
# Builds the page with the stand-in and without it (connectOf = null), and runs the two timed files on each in turn.
set -e
cd /home/user/wt/2-1-grips
mkdir -p .probe/dist-grips .probe/dist-nogrips .probe/runs
node canvas/app/build.mjs > /dev/null
cp -r canvas/dist/. .probe/dist-grips/
cp canvas/app/src/plane/gestures/connect.ts .probe/connect.keep.ts
python3 - <<'PY'
p='/home/user/wt/2-1-grips/canvas/app/src/plane/gestures/connect.ts'
s=open(p).read()
a=s.index('// ==== STAND-IN'); b=s.index('// ==== end of the stand-in')
open(p,'w').write(s[:a]+'export const connectOf: ((store: ViewStore) => ConnectGesture) | null = null;\n'+s[b:])
PY
node canvas/app/build.mjs --out .probe/dist-nogrips > /dev/null
cp .probe/connect.keep.ts canvas/app/src/plane/gestures/connect.ts
set +e
for i in 1 2 3; do
  for v in grips nogrips; do
    cp -r .probe/dist-$v/. canvas/dist/
    for f in scale instant; do
      node --test --test-timeout=120000 canvas/app/test/$f.test.mjs > .probe/runs/$v-$f-$i.txt 2>&1
    done
  done
done
cp -r .probe/dist-grips/. canvas/dist/
node canvas/app/build.mjs --check > .probe/runs/check-after.txt 2>&1
echo "variants done" >> .probe/runs/check-after.txt
