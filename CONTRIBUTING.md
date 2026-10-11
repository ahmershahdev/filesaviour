# Contributing

1. `npm run dev` (from the repo root) sets everything up and starts the site at http://127.0.0.1:8000.
2. Fork the repo and branch from `master` in your fork: `feat/<short-name>`, `fix/<short-name>`. The main repo keeps a single branch, `master`; merged branches are deleted automatically.
3. Keep business logic in `services.py` / `selectors.py`, not views. Keep pages thin; put UI in `features/`.
4. `npm test` must pass. CI runs the same checks on every pull request.
5. Open a pull request using the template. `master` is protected: changes land through PRs with green CI.

By contributing you agree your work is released under the [MIT License](LICENSE.txt).

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit together.
