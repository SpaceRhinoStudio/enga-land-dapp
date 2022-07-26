# EngaLand Dapp

This repository hosts the decentralized application for [EngaLand Protocol](https://enga.land).  
latest stable version is hosted [here](https://app.enga.land/).  
For more information about the protocol please visit the [EngaLand Wiki](https://docs.enga.land).

## Technologies

Notable technologies used in this project consist of:

- [Svelte](https://svelte.dev)  
   Base framework
- [Svelte-kit](https://kit.svelte.dev)  
   Bundler, preprocessor, and compiler extensions for Svelte
- [Ethers](https://docs.ethers.io/v5/)  
   Ethereum client library, used for simpler interaction with the blockchain
- [ReactiveX](https://rxjs.dev)  
   Reactive programming library, used for having reactive logic components
- [IPFS](https://js.ipfs.io)  
   IPFS client library, used for storing and retrieving files from the IPFS network
- [TailwindCSS](https://tailwindcss.com)  
   CSS framework, used for styling the application

## Structure

### Directory structure

Basis of directory structure is formed by [Svelte-kit](https://kit.svelte.dev)

```
root
├── src/
│   ├── assets/
│   ├── contracts/
│   ├── lib/
│   │   ├── actions/
│   │   ├── classes/
│   │   ├── configs/
│   │   ├── contexts/
│   │   ├── helpers/
│   │   ├── observables/
│   │   ├── operators/
│   │   ├── providers/
│   │   ├── services/
│   │   ├── shared/
│   │   │   ├── assets/
│   │   │   ├── locales/
│   │   │   ├── styles/
│   │   │   └── ... {same as lib/}
│   │   ├── types/
│   │   └── utils/
│   └── routes/
├── static/
└── contracts/
```

- `src/`: source code root
  - `assets/`: assets, containing icons, images, SVG, etc.
  - `contracts/`: contracts helpers
  - `lib/`: Svelte components
    - `actions/`: Svelte actions
    - `classes/`: class entities that don't fit in services
    - `configs/`: root for various configuration sources
    - `contexts/`: shared Svelte stores, RxJS subject instances used for sharing data between components, shared class instances and constants
    - `helpers/`: helpers for specific use cases, (not to be mixed with _utils_)
    - `observables/`: observables for specific data shared between components
    - `operators/`: RxJS operators mostly used as building blocks of _observables_
    - `providers/`: async factories for specific use cases (not to be confused with _services_)
    - `services/`: collection of focused functionalities packed into classes (not to be confused with _classes_)
    - `shared/`: submodule containing shared source code and assets between this repository and landing page repository
      - `assets/`: shared assets
      - `locales/`: localization files ([more](src/lib/shared/locales/README.md))
      - `styles/`: styles containing CSS and fonts
      - ... the rest is same as `lib/` (no recursion!)
    - `types/`: types shared by any components
    - `utils/`: utility helpers that are used across a wide variety of components (not to be mixed with _helpers_)
  - `routes/`: [Svelte-kit routes](https://kit.svelte.dev/docs/routing) root
- `static/`: files to be served statically and referred to by _links_ instead of `import` statements
- `contracts/`: root for contracts submodules

## Project configuration

### Git

#### Submodules

`preinstall` script is used to initialize submodules. it runs before `yarn install` or `yarn` command automatically.  
A compatibility script is located for deploying on [Vercel](http://vercel.com) because the platform does not support pulling submodules using ssh.  
if you're using the compatibility script you need to add `GITHUB_ACCESS_TOKEN` environment variable to your project. unless the respected repositories are made public in the future.

#### Hooks

[husky](https://github.com/typicode/husky) is used to manage git hooks.

- _pre-commit_  
  used to format and lint the staged changes using [lint-staged](https://github.com/okonet/lint-staged).
- _pre-push_  
  used to run tests and run a `build` script to make sure the project is ready for production.

### Scripts

Main scripts used in this project:

- `build`  
  used to build the project for production. build process is targeted for [Cloudflare Pages](https://pages.cloudflare.com).
- `lint`  
  used to lint the project.
- `test`  
  used to run all the tests throughout the whole project.
- `dev`  
  used to run the project in development mode with HMR.
- `preview`  
  used to serve the built version locally.
- `format`  
  used to format all the files recursively using [Prettier](https://prettier.io) with the respected config located at the root of the project. **Caution**, this scripts overwrites all the files.

## Documentation

### Svelte components

#### Component

Every Svelte component has a `@component` description in the file.  
followed by a list of events documented by `@emits`, if it emits any.  
followed by a list of slots, documented by `@slot` if it accepts any.  
slot documentations also include the props passed to them documented by `@prop` for each.  
there is a separator (single `@`) between the mentioned sections above.

#### Component Props

- by default the props will be coming from parent (optional or required) and will not be mutated by the component.
- `@default`  
  every default value assigned to a prop is documented with `@default`. (unless it's a neutral value, like `undefined` or an empty class list).
- `@readonly`  
  in case of a prop that is meant to be exported and never mutated by the parent component, it will be documented with `@readonly`.
- `@lends`  
  in case of an optional prop that can be passed from parent (and later mutated by it) but is mainly meant to be exported by the component, it will be documented with `@lends`.
- `@borrows`  
  in case of a required prop that must be passed from the parent but can be mutated by the component, it will be documented with `@borrows`.
- **Caution**: in case of development always make sure logic is acting as expected when you're lending a prop that you borrowed from children.
