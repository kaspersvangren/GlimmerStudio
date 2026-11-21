#!/bin/bash
# alle billedarkene, hvor alt sættes sammen med alt. Uden argument køres de alle; ellers kun dem, der nævnes (fx ./kombi.sh hat-haar dyr-pynt)
cd "$(dirname "$0")"
k(){ if [ -z "$KUN" ] || [[ " $KUN " == *" $1 "* ]]; then node kombi.js "$@" 2>&1 | grep -v "^ark "; fi; }
KUN="$*"
k hat-haar      hat      hår      492,130,180,300 ""                    .6
k hat-pande     hat      pande    492,130,180,300 ""                    .6
k kappe-toej    kappe    tøj      430,250,300,520 "hat:ingen"           .43
k haar-kappe    hår      kappe    430,250,300,520 "hat:ingen"           .43
k toej-stoevler tøj      støvler  490,540,190,230 ""                    .68
k tilb-toej     tilbehør tøj      410,250,330,520 "hat:ingen"           .4
k hat-tilb      hat      tilbehør 470,130,220,300 ""                    .78
k dyr-pynt      kind     pynt     140,400,340,370 ""                    .5
k dyr-moenster  kind     moenster 140,400,340,370 ""                    .55
