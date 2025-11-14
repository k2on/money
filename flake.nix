{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };
  outputs = {nixpkgs, ...}: let
    forAllSystems = function:
      nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed
      (system: function nixpkgs.legacyPackages.${system});
  in {
    formatter = forAllSystems (pkgs: pkgs.alejandra);
    devShells = forAllSystems (pkgs: {
      default = pkgs.mkShell {

        shellHook = ''
          dev() {
            process-compose up -p 0
          }
        '';
        packages = with pkgs; [
          corepack
          nodejs_22
          bun

          postgresql
          process-compose
        ];
      };
    });
  };
}
