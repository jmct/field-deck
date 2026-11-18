# The jmct theme is vendored in theme/.  Putting it on TEXINPUTS here
# (rather than in the Makefile) means `latexmk talk.tex`, editors, and
# `make` all find it.  The trailing // searches subdirectories.
ensure_path('TEXINPUTS', './theme//');

$pdf_mode = 1;
