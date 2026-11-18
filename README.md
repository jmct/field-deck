# talk-template

A starting point for a beamer talk in the jmct theme.  Clone it, enter
the nix shell, replace the placeholders, run `make`.

```
git clone <this repo> my-talk && cd my-talk
rm -rf .git && git init          # optional: start the talk's own history
nix develop                      # or: direnv allow  (.envrc says `use flake`)
make                             # -> talk.pdf
```

Works on Linux and macOS (x86_64 and aarch64).  Everything (TeX Live,
pgfplots, latexmk, make, gawk) comes from the pinned `flake.lock`, so
every machine builds the same PDF.  Nothing needs to be installed in
`~/texmf`: the theme is vendored in `theme/`.

On a machine without flakes enabled, prefix with
`nix --extra-experimental-features 'nix-command flakes' develop`.
`nix build` builds the PDF without a shell (`result/talk.pdf`), but
only sees files git knows about, so `git add` new files first.

## Layout

```
talk.tex            the deck: placeholder frames, charts, TikZ diagrams
theme/              vendored jmct beamer theme (see theme/README.md)
plots/*.tex         standalone pgfplots charts, one per file
plots/style.tex     shared chart style (theme colours, fonts, axis look)
plots/data/*.csv    placeholder random data; generate.sh regenerates it
figs/               your own images (PNG/JPG/PDF), found by \includegraphics
build/              generated: compiled charts (git-ignored)
flake.nix           dev shell and `nix build`
.latexmkrc          puts theme/ on TEXINPUTS for latexmk and editors
```

## Make targets

| Target | What it does |
| --- | --- |
| `make` | build every chart in `plots/`, then `talk.pdf` |
| `make plots` | build only the charts into `build/plots/` |
| `make watch` | rebuild `talk.pdf` on every save (`make plots` again after editing a chart) |
| `make data` | regenerate the placeholder CSVs |
| `make clean` | remove all build products |

## Charts

Each `plots/<name>.tex` is a `standalone` document.  `make` compiles it
to `build/plots/<name>.pdf`, and the deck includes it by name:

```latex
\chartframe{Frame title}{<name>}             % one chart, full frame
\includegraphics[width=\linewidth]{<name>}   % anywhere else
```

To add a chart, copy one of the examples (`line`, `bars`, `scatter`,
`histogram`), point it at your CSV in `plots/data/`, and add a
`\chartframe` to `talk.tex`.  The Makefile picks up new files by
itself.  Start each chart with `\input{style.tex}` and give the axis
`jmct axis`; `\charttitle{Headline}{subtitle}` makes the two-line
title, and the colours `series1`..`series4`, `ink`, `inkmuted` match
the theme.  A chart can be built by hand with
`cd plots && latexmk -pdf <name>.tex`.

## Diagrams

TikZ diagrams live inline in `talk.tex` so beamer overlays work.  The
preamble defines styles in the theme palette (`box`, `hot`, `dot`,
`link`, `note`) and `visible on=<n->`, which reveals a node or edge from
step *n* while keeping its space.  The examples are a pipeline revealed
step by step, a small graph, and a layered stack with a brace.

## The theme

`theme/` is a copy of `~/docs/beamer-jmct/theme` taken on 2026-11-18.
See `theme/README.md` for `\blueit`, `\code`, `codeblock`, `\myquote`
and the theme options.  (Ignore its "Install" section; the vendored copy
needs no install.)  To pick up later theme changes:

```
cp ~/docs/beamer-jmct/theme/*.sty theme/
```
