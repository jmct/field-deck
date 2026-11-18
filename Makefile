TALK  := talk
LATEXMK := latexmk -pdf -interaction=nonstopmode -halt-on-error

# Every plots/*.tex is a standalone pgfplots chart, built to
# build/plots/<name>.pdf and pulled into the deck with \includegraphics.
# plots/style.tex is the shared style, not a chart.
PLOTS := $(filter-out style,$(basename $(notdir $(wildcard plots/*.tex))))
PLOT_PDFS := $(PLOTS:%=build/plots/%.pdf)

all: $(TALK).pdf

$(TALK).pdf: $(TALK).tex $(wildcard theme/*.sty) $(PLOT_PDFS)
	$(LATEXMK) $<

# The charts are compiled from inside plots/ so their relative paths
# (data/*.csv, style.tex) resolve the same way when built by hand.
build/plots/%.pdf: plots/%.tex plots/style.tex $(wildcard plots/data/*.csv)
	@mkdir -p build/plots
	cd plots && $(LATEXMK) -outdir=../build/plots $(notdir $<)

# Smoothed trend series (robust LOWESS) for plots/trends.tex
SMOOTHED := plots/data/lean-trends-smooth.csv plots/data/software-verification-trends-smooth.csv
build/plots/trends.pdf: $(SMOOTHED)
plots/data/%-smooth.csv: plots/data/%.csv plots/data/lowess.awk
	gawk -v SPAN=0.35 -F, -f plots/data/lowess.awk $< > $@

plots: $(PLOT_PDFS)

# Rebuild the deck on every save (rerun `make plots` after editing a chart)
watch: $(PLOT_PDFS)
	$(LATEXMK) -pvc $(TALK).tex

# Regenerate the placeholder random data
data:
	bash plots/data/generate.sh

clean:
	latexmk -C $(TALK).tex
	rm -f *.nav *.snm *.vrb
	rm -rf build

.PHONY: all plots watch data clean
