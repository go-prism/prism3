# NPM API

This page documents the work required to enable the NPM archetype in Prism.

Tasks:
1. [x] Check db for record
   1. [x] `/{package}` return full document
   2. [x] `/{package}/{version}` return partial document
2. [x] Query remotes for *packument*
4. [x] Store and merge response in db

Docs:
* [NPM Registry API](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#endpoints)