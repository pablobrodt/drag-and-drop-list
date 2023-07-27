# drag-and-drop-list

[This project can be accessed here](https://pablobrodt.github.io/drag-and-drop-list/)

## Steps i did for this project setup

1. npm init to start package.json file
2. tsc --init to start typescript config file
3. set the configurations on tsconfig
   1. target: es6
   2. rootDir: ./src
   3. sourceMap: true
   4. outDir: ./dist
   5. exclude: [node_modules]
4. set up run (lite-server) and watch script
5. set up debug config for vscode
6. add gitignore file

## Changelog

### 1.0.0
Single file project following course instructions

### 2.0.0
- Separated code into files using namespaces
- Added some scripts to run and build

### 3.0.0
- Changed namespaces to esmodule
- Added script to push dist files to github pages branch

### 4.0.0
- Added webpack to build project
- Remove script that pushed dist files to github pages due to use of github actions to build and distribute project