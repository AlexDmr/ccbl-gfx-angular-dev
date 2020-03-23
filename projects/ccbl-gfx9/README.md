# CcblGfx9

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.3.

## Todo
* Sous-programmes et références à des sous-programmes
* Représenter la relation de séquence, avec la notion de boucle, un menu spécial pour cette relation ?
* Couper, copier, coller : des menus à placer aux endroits des zones de drops ?

## Fait
* Contextes évennementiels
    * Exprimer "une expression devient vraie"
    * Exprimer "un évennement se déclenche", avec la notion de filtre qui est gérée par CCBL
* Gérer les expressions, en particulier pour les interpolations
    * [V0, V1, duration, interpolator]
    *     Interpolators:
          waitEnd: (dt, v0, v1) => dt >= 1 ? v1 : v0,
          linear: (dt, v0, v1) => v0 + dt * (v1 - v0),
          easeInOut: (dt, v0, v1) => dt < 0.5 ? v0+(v1-v0)*2*dt*dt : v0-(v1-v0)/2*((2*dt-1)*(2*dt-3)-1)
* Drag drop des contextes d'états, en gérant les positions, vérifier que toutes les relations d'Allen sont accessibles.


## Code scaffolding

Run `ng generate component component-name --project ccbl-gfx9` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ccbl-gfx9`.
> Note: Don't forget to add `--project ccbl-gfx9` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build ccbl-gfx9` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ccbl-gfx9`, go to the dist folder `cd dist/ccbl-gfx9` and run `npm publish`.

## Running unit tests

Run `ng test ccbl-gfx9` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
