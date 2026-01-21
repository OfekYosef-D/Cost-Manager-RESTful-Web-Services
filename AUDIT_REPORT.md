# Audit Report

## Repo overview
- Languages: JavaScript (Node.js/Express), JSON, Markdown, Python
- Services: logs, users, costs, admin (separate Express apps)
- Entry points: `logs_service/logs_service.js`, `users_service/users_service.js`, `costs_service/costs_service.js`, `admin_service/admin_service.js`
- Build/test: npm scripts in root `package.json`, service-level `package.json` files, `tests/run_tests.js`
- Config: `.env` (from `env.template`), new `config/identity.js`
- Docs: `README.md`

## Findings
| File path | Exact string found | Why sensitive/hardcoded | Recommended fix | Risk level |
| --- | --- | --- | --- | --- |
| `admin_service/admin_service.js` | `first_name: 'Sagi'`, `last_name: 'Nevet'` (and other team names) | Real names embedded in runtime response | Move to config/env and return from config | High |
| `scripts/init_database.js` | `id: 123123`, `first_name: 'mosh'`, `last_name: 'israeli'` | Identity baked into seed data | Move to config/env, use defaults in template | High |
| `scripts/clean_database.js` | `id: 123123`, `first_name: 'mosh'`, `last_name: 'israeli'` | Identity baked into maintenance script | Move to config/env | High |
| `README.md` | `Final Project in Asynchronous Server-Side Development Course` | Course identifier attribution | Remove or move to acknowledgements | Medium |
| `README.md` | `https://*-service-*.onrender.com/...` | Hostnames reveal origin/deployment | Replace with placeholders or local URLs | Medium |
| `README.md` | `"first_name": "mosh"`, `"last_name": "israeli"` | Personal names in docs | Use placeholders | Medium |
| `tests/run_tests.js` | `/api/users/123123`, `userid: 123123` | Fixed identifier in tests | Read from config/env | Low |
| `test_project.py` | Onrender URLs and `id=123123` | Fixed deployment + id | Read from env | Medium |
| `res.txt` | Onrender URLs and names | Output artifact with identifiers | Delete or regenerate | Low |
| `package.json` | `Final Project` in description | Course identifier | Remove from description | Low |

## Proposed fixes by priority
P0
- Parameterize team members and initial user identity into `config/identity.js` and `.env`.
- Remove course and deployment identifiers from docs.
- Delete `res.txt` and regenerate with local settings when needed.

P1
- Update tests and helper scripts to use config/env for user id and service URLs.
- Align `env.template` with new identity configuration.

P2
- Optional refactors to reduce duplication (shared logging helper) and trim verbose comments.
- Add `ACKNOWLEDGEMENTS.md` if you need formal attribution per course rules.

## Legitimate refactor suggestions
- Extract shared Pino/MongoDB logging stream to a helper module used by all services.
  - Rationale: avoids copy/paste and makes logger changes consistent.
  - Scope: medium (4 services).
  - Tests: smoke test each service start, run `npm test`.
- Normalize validation helpers in costs/users services (e.g., type checks for ids and categories).
  - Rationale: reduces repeated validation code and error message drift.
  - Scope: small to medium.
  - Tests: unit tests for validation paths and existing API tests.
- Reduce comment verbosity to highlight only non-obvious logic.
  - Rationale: improves readability without changing behavior.
  - Scope: small.
  - Tests: none.

## PR-style plan
- [ ] Commit 1: Add `config/identity.js`, wire admin service and scripts to config.
- [ ] Commit 2: Update tests and helper script (`test_project.py`) to use config/env.
- [ ] Commit 3: Update `README.md` and `env.template` with placeholders and new variables.
- [ ] Commit 4: Remove `res.txt` and note regeneration workflow.
- [ ] Commit 5: (Optional) Shared logger helper and comment cleanup.
