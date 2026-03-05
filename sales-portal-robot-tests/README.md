# Sales Portal Robot Framework Tests

Robot Framework + Browser Library (Playwright) test automation for the Sales Portal application.
This framework mirrors the TypeScript (Playwright) and Python (pytest) projects, implemented in RF keyword syntax.

## Prerequisites

- Python 3.10+
- Docker + Docker Compose (to run the application locally)
- Node.js 18+ (required by Browser Library / Playwright)

## Quick Start

```bash
# 1. Clone the repo and enter the project
git clone <repo-url>
cd sales-portal-robot-tests

# 2. Install Python dependencies
pip install -e .

# 3. Initialise the Browser Library node server and download Chromium
rfbrowser init chromium

# 4. Start the application
cd sales-portal && docker compose up --build -d && cd ..

# 5. Run all tests
make test-all
```

## Running Specific Suites

```bash
# API tests only
make test-api

# UI tests only (also runs auth setup)
make test-ui

# Smoke tests
make test-smoke

# Single test file
TEST_ENV=dev python -m robot tests/api/products/test_create_product.robot

# By tag
TEST_ENV=dev python -m robot --include smoke tests/

# Dry run (syntax check — no browser needed)
TEST_ENV=dev python -m robot --dryrun tests/
```

> **Note:** Always use `python -m robot` (not the bare `robot` command).
> The `-m` flag adds the CWD to `sys.path`, which is required for library imports.

## Environment Setup

Copy `.env.dist` to `.env` and fill in any values you want to override:

```bash
cp .env.dist .env
```

| Variable | Default | Description |
|---|---|---|
| `TEST_ENV` | `dev` | Target environment (`dev`) |
| `BROWSER` | `chromium` | Playwright browser |
| `HEADLESS` | `True` | Run browser headlessly |

Default admin credentials: `admin@example.com` / `admin123`

| Service | URL |
|---|---|
| Frontend | <http://localhost:8585> |
| Backend API | <http://localhost:8686> |
| Swagger | <http://localhost:8686/api/docs> |

## Reporting

After a test run, open the RF reports in `results/`:

```bash
xdg-open results/report.html   # high-level pass/fail summary
xdg-open results/log.html      # keyword-level execution log with screenshots
```

Merge API and UI reports into one:

```bash
make merge-results
```

## Project Structure

```
sales-portal-robot-tests/
├── variables/          # env.py, api_config.py, constants.py
├── libraries/
│   ├── api/            # ApiClientLibrary + endpoint libraries
│   ├── stores/         # EntityStoreLibrary (TEST scope — cleanup tracking)
│   ├── utils/          # DataGeneratorLibrary, ValidationLibrary
│   └── mock/           # MockLibrary (Playwright network interception)
├── resources/
│   ├── api/
│   │   ├── service/    # High-level API service keywords
│   │   └── facades/    # Multi-step order lifecycle keywords
│   └── ui/
│       ├── pages/      # Page-object resources (base, login, orders, …)
│       └── service/    # UI service keywords
├── data/
│   ├── models/         # Pydantic models
│   ├── enums/          # StrEnum classes
│   ├── schemas/        # JSON Schema dicts for response validation
│   ├── generators/     # Faker-based data generators
│   └── ddt/            # CSV files for DataDriver tests
├── tests/
│   ├── api/            # API test suites (login, products, customers, orders)
│   └── ui/
│       ├── orders/     # UI test suites (create, details, delivery, …)
│       ├── integration/ # Mock-based integration tests
│       └── auth_setup.robot
├── scripts/
│   └── notify_telegram.py
├── Makefile
├── robot.toml          # RF config (outputdir, loglevel, variablefiles)
└── robocop.toml        # Robocop linter config
```

### Architecture Layers (bottom → top)

```
Variables  →  Python Libraries  →  Resource Files  →  Test Suites
```

- **Variables** provide environment URLs, endpoints, timeouts
- **Python Libraries** wrap HTTP (`ApiClientLibrary`), browser (`Browser`), data generation, validation, and mock interception
- **Resource Files** compose keywords — no logic directly in tests
- **Test Suites** call service-level keywords and assert outcomes

## Adding New Tests

| What you need | Where to add it |
|---|---|
| New API endpoint wrapper | `libraries/api/endpoints/` |
| New high-level API action | `resources/api/service/` |
| New UI page interaction | `resources/ui/pages/` |
| New high-level UI flow | `resources/ui/service/` |
| New API test | `tests/api/<domain>/` |
| New UI test | `tests/ui/orders/` |
| New mock-based test | `tests/ui/integration/` |

## Linting

```bash
make lint
```

Runs ruff, mypy, and robocop. All must pass with zero issues before merging.

## CI/CD

GitHub Actions workflows live in `.github/workflows/`:

| Workflow | Trigger | What it does |
|---|---|---|
| `build.yml` | PR to `main` | ruff + mypy + robocop lint check |
| `tests.yml` | Push/PR to `main`, manual | Full API + UI run; uploads `robot-report` artifact; sends Telegram notification |

After a CI run, download the **robot-report** artifact from the Actions run to browse `log.html` and `report.html` locally.

Required repository secrets for Telegram notifications: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
