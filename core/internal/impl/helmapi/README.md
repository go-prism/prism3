# Helm API

This page documents the work required to enable the Helm archetype in Prism.

Known issues:
* Large `index.yaml` files (e.g. Bitnami) cause rapid memory usage increases
* Identical charts+versions in different remotes will be served on a first-come-first-serve basis

Tasks:
1. [x] Fetch existing indices from all remotes
2. [x] Merge indices
3. [x] Rewrite URLs to Prism-relative
4. [ ] Serve/save `index.yaml`
5. [x] Custom `Remote` implementation that fetches original Helm package
