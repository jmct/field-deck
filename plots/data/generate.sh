#!/usr/bin/env bash
# Regenerate the placeholder CSVs in this directory.  The numbers are
# random (fixed seeds) and mean nothing; replace them with real data.
#
#   make data      (from the repo root, inside the nix shell)
#
# Uses gawk, which the nix shell provides; other awks seed differently
# and would produce different (equally meaningless) numbers.
set -euo pipefail
cd "$(dirname "$0")"

# Three random walks over 50 steps -> line plot
gawk 'BEGIN {
  srand(1); a = 10; b = 12; c = 8
  print "x,a,b,c"
  for (x = 0; x <= 50; x++) {
    printf "%d,%.2f,%.2f,%.2f\n", x, a, b, c
    a += rand() - 0.42; b += rand() - 0.50; c += (rand() - 0.45) * 1.5
  }
}' > series.csv

# Two groups over six categories -> grouped bar chart
gawk 'BEGIN {
  srand(2)
  print "label,before,after"
  split("Alpha Beta Gamma Delta Epsilon Zeta", L, " ")
  for (i = 1; i <= 6; i++) {
    v = 20 + int(rand() * 60)
    printf "%s,%d,%d\n", L[i], v, v + int((rand() - 0.3) * 30)
  }
}' > categories.csv

# Two clusters of correlated points -> scatter plot
gawk 'function gauss() { return sqrt(-2 * log(1 - rand())) * cos(6.283185307 * rand()) }
BEGIN {
  srand(3)
  print "x,y,group"
  for (i = 0; i < 60; i++) { x = 2 + gauss();       printf "%.3f,%.3f,0\n", x, 0.8 * x + 0.6 * gauss() }
  for (i = 0; i < 60; i++) { x = 5 + gauss() * 1.2; printf "%.3f,%.3f,1\n", x, 1.5 + 0.4 * x + 0.7 * gauss() }
}' > scatter.csv

# 500 samples from a normal distribution -> histogram
gawk 'function gauss() { return sqrt(-2 * log(1 - rand())) * cos(6.283185307 * rand()) }
BEGIN {
  srand(4)
  print "value"
  for (i = 0; i < 500; i++) printf "%.3f\n", 50 + 12 * gauss()
}' > samples.csv

echo "wrote series.csv categories.csv scatter.csv samples.csv"
