# Contributing

1. `python run.py` sets everything up and starts the site at http://127.0.0.1:8000.
2. Branch from `master`: `feat/<short-name>`, `fix/<short-name>`.
3. Keep business logic in `services.py` / `selectors.py`, not views. Keep pages thin; put UI in `features/`.
4. `python run.py test` must pass. CI runs the same checks on every pull request.
5. Open a pull request using the template. `master` is protected: changes land through PRs with green CI.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit together.
