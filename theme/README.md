<!-- Vendored from ~/docs/beamer-jmct (README.md + theme/) on 2026-11-18.  The "Install" and "Start a talk" sections below describe the upstream repo; in this template the theme needs no install. -->

# beamer-jmct

A beamer theme (`\usetheme{jmct}`) plus a starter deck.  Off-white canvas,
Computer Modern serif in magenta, blue accents, a short blue bar beside
each frame title, and code in dark grey.  Extracted from the
"What About the Natural Numbers?" talk.

```
theme/      the theme: beamer{,color,font,inner,outer}themejmct.sty
template/   a starter deck (talk.tex, Makefile, .gitignore)
```

## Install

```
make install        # symlinks theme/ into $TEXMFHOME/tex/latex/beamer-jmct
```

TEXMFHOME is normally `~/texmf`, which every TeX Live (including the nix
one) searches without any `texhash`.  Because it is a symlink, editing
`theme/*.sty` changes every talk that uses the theme.  `make uninstall`
removes the link.

## Start a talk

```
make new NAME=my-talk      # creates ../my-talk from template/
cd ../my-talk && make      # builds talk.pdf with latexmk
```

`make watch` rebuilds on every save.  Talks only need `\usetheme{jmct}`;
nothing is copied into the talk's directory.

## What the theme gives you

Theme option: `\usetheme[titlesize=48]{jmct}` sets the title-page title
size in points (default 88, which fits about three short words per line).

| Command / environment | What it does |
| --- | --- |
| `\blueit{text}` | text in the accent blue |
| `\blueite{text}` | emphasised text in the accent blue |
| `\myquote{quotation}{who}{when}` | quotation, rule, right-aligned attribution |
| `\code{...}` | inline code: typewriter, dark grey |
| `codeblock` environment | centred, syntax-highlighted display code |
| `codeblock*` environment | legacy: plain verbatim with overlay commands live |

Colours are also available by name: `my-magenta`, `lucid-blue`,
`dark-lucid-blue`, `galois-blue`, `galois-yellow`, `dark-gray`,
`light-gray`, `off-white`.  The beamer colours `accent` and `code` are
what `\blueit` and `\code` use, so `\setbeamercolor{code}{fg=...}` in a
talk's preamble retunes them.

### Code

Inline, `\code{Succ (Succ Z)}` is robust: it works inside `\item<2->`,
`\frametitle`, footnotes and math.  Characters such as `_ ^ & $ < > ~ \`
print literally.  It cannot take unbalanced braces, `%` (a comment) or
`#` (prints doubled).  For those use `\verb` in a `[fragile]` frame.

Display code goes in `codeblock`.  The frame must be `[fragile]`, and
lines are reproduced exactly (start them in column 0 unless you want
indentation).  The optional argument takes [listings](https://ctan.org/pkg/listings)
keys; with a `language` the keywords, comments and strings are coloured
in the theme palette, without one the block is plain:

```latex
\begin{frame}[fragile]
  \frametitle{Atomic Operations}
  \begin{codeblock}[language=C]
int current = atomic_load(target);     /* keywords blue, comments grey */
  \end{codeblock}
\end{frame}
```

Useful keys: `language=C`, `language=Haskell`, `morekeywords={type,where}`
for words the language definition lacks, `basicstyle=\ttfamily\footnotesize`
for smaller type.

Anything between `(*@` and `@*)` is ordinary TeX, which is how overlays
work: `\onslide<n->` at the start of a line reveals it from step n on
(the line keeps its space while hidden, so the block never jumps), and
`\alt<n>{a}{b}` swaps text (keep both the same width):

```latex
\begin{frame}[fragile]
  \frametitle{Position/Index}
  \begin{codeblock}[language=Haskell]
position : elem -> List elem -> (*@\alt<4>{Option Nat}{??????????}@*)
(*@\onslide<2->@*)position a xs = pos xs 0
  where
(*@\onslide<3->@*)    pos (x::xs) n = if a == x then n else pos xs (Succ n)
    pos []      n = (*@\alt<4>{None}{????}@*)
  \end{codeblock}
\end{frame}
```

`codeblock*` is the older plain-verbatim variant, kept so existing decks
build: no highlighting, and `\`, `{`, `}` are live so `\uncover<2->{...}`
works per line.  New decks should use `codeblock`.

A frame whose title changes between steps can use
`\frametitle<1>{Before}` and `\frametitle<2->{After}`.

## Notes on the look

The blue mark beside each frame title is a 0.2cm bar flush with the left
page edge, 0.5cm from the top, 1.2cm tall (`beamerouterthemejmct.sty`).
The title page shows only title and subtitle; author and date are
ignored.  Title-page title is 88pt on 58pt leading unless `titlesize` is
given.  `\usefonttheme{serif}` is part of the theme.
