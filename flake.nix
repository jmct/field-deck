{
  description = "Beamer talk (jmct theme) with pgfplots charts and TikZ diagrams";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAll = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});

      # scheme-medium already has beamer, listings, fancyvrb, booktabs,
      # tabularx, amsmath and xcolor.
      texFor = pkgs: pkgs.texliveMedium.withPackages (ps: with ps; [
        standalone   # the chart files in plots/
        pgf
        pgfplots
        cm-super     # Type 1 Computer Modern for the T1-encoded charts
        latexmk
      ]);

      toolsFor = pkgs: [
        (texFor pkgs)
        pkgs.gnumake
        pkgs.gawk           # plots/data/generate.sh
        pkgs.poppler-utils  # pdftoppm / pdftotext, handy for checking output
      ];
    in {
      devShells = forAll (pkgs: {
        default = pkgs.mkShell { packages = toolsFor pkgs; };
      });

      # `nix build` produces result/talk.pdf without entering a shell.
      packages = forAll (pkgs: {
        default = pkgs.stdenvNoCC.mkDerivation {
          name = "talk";
          src = self;
          nativeBuildInputs = toolsFor pkgs;
          # TeX wants a writable home for its caches.
          buildPhase = ''
            export HOME=$TMPDIR
            make
          '';
          installPhase = ''
            mkdir -p $out
            cp talk.pdf $out/
          '';
        };
      });
    };
}
