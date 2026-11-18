# Robust LOWESS smoother (Cleveland 1979) for a monthly CSV with a header
# and two columns: "date",value.  Prints  i,date,raw,smooth  where i is the
# 0-based month index (the x used by plots/trends.tex).
#
#   awk -v SPAN=0.35 -F, -f lowess.awk lean-trends.csv > lean-trends-smooth.csv
#
# Each point is fitted by a weighted local straight line over the nearest
# ceil(SPAN*n) points, tricube distance weights; then ITER robustness passes
# downweight points with large residuals (bisquare on 6*median|residual|),
# so isolated outliers such as months reported as 0 pull the curve less.
BEGIN { if (SPAN == "") SPAN = 0.35; if (ITER == "") ITER = 2 }
NR == 1 { next }
{ gsub(/"/, "", $1); n++; d[n] = $1; x[n] = n - 1; y[n] = $2 + 0; rw[n] = 1 }
function fit(   i, j, k, h, dist, w, sw, sx, sy, sxx, sxy, b, a, mx, tmp, dd) {
  k = int(SPAN * n + 0.999999); if (k < 3) k = 3
  for (i = 1; i <= n; i++) {
    # bandwidth h = distance to the k-th nearest point
    for (j = 1; j <= n; j++) dd[j] = (x[j] > x[i] ? x[j] - x[i] : x[i] - x[j])
    asort(dd, tmp); h = tmp[k]; if (h <= 0) h = 1
    h *= 1.000001
    sw = sx = sy = sxx = sxy = 0
    for (j = 1; j <= n; j++) {
      dist = (x[j] > x[i] ? x[j] - x[i] : x[i] - x[j]) / h
      w = (dist < 1 ? (1 - dist^3)^3 : 0) * rw[j]
      sw += w; sx += w * x[j]; sy += w * y[j]
    }
    mx = sx / sw
    for (j = 1; j <= n; j++) {
      dist = (x[j] > x[i] ? x[j] - x[i] : x[i] - x[j]) / h
      w = (dist < 1 ? (1 - dist^3)^3 : 0) * rw[j]
      sxx += w * (x[j] - mx)^2; sxy += w * (x[j] - mx) * y[j]
    }
    b = (sxx > 0 ? sxy / sxx : 0); a = sy / sw
    s[i] = a + b * (x[i] - mx)
  }
}
END {
  fit()
  for (it = 1; it <= ITER; it++) {
    for (i = 1; i <= n; i++) r[i] = (y[i] - s[i] < 0 ? s[i] - y[i] : y[i] - s[i])
    m = asort(r, rs); med = (m % 2 ? rs[(m + 1) / 2] : (rs[m / 2] + rs[m / 2 + 1]) / 2)
    for (i = 1; i <= n; i++) {
      u = (med > 0 ? (y[i] - s[i]) / (6 * med) : 0); if (u < 0) u = -u
      rw[i] = (u < 1 ? (1 - u^2)^2 : 0)
    }
    fit()
  }
  print "i,date,raw,smooth"
  for (i = 1; i <= n; i++) printf "%d,%s,%g,%.2f\n", x[i], d[i], y[i], s[i]
}
