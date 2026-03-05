# CLAUDE.md — Sales Portal Robot Framework Tests

## Project Goal
Robot Framework + Browser Library (Playwright) re-implementation of the Sales Portal test automation framework. Mirrors the TypeScript (Playwright) project architecture using RF keyword syntax.

## Application Under Test
Start locally: `cd sales-portal && docker-compose up --build`

| Service       | URL                              |
|---------------|----------------------------------|
| Frontend      | http://localhost:8585            |
| Backend API   | http://localhost:8686            |
| Swagger       | http://localhost:8686/api/docs   |
| Mongo Express | http://localhost:8081            |

Credentials: `admin@example.com` / `admin123`

## Running Tests

**Always use `python -m robot`** (not `robot`) — the `-m` flag adds CWD to `sys.path`, which is required for library imports like `libraries/api/api_client.py`.

```bash
# All API tests
cd sales-portal-robot-tests
TEST_ENV=dev python -m robot tests/api/

# Single suite
TEST_ENV=dev python -m robot tests/api/products/

# By tag
TEST_ENV=dev python -m robot --include smoke tests/

# Dry run (syntax check)
TEST_ENV=dev python -m robot --dryrun tests/
```

## Architecture (Layer Order: Bottom → Top)

```
Variables (env.py, api_config.py, constants.py)
  ↓
Python Keyword Libraries (libraries/)
  ↓
Robot Resource Files (resources/)
  ↓
Test Suites (tests/)
```

**Rule:** Resource files compose keywords — no imperative logic in `.resource` files.

## Critical Naming Rules

1. **`ApiClientLibrary` MUST be imported with `WITH NAME    ApiClient`** — endpoint libraries resolve it via `BuiltIn().get_library_instance("ApiClient")`.
2. `RequestsLibrary` is installed as a dependency but its keywords (`GET`, `POST`, etc.) are NOT used in test suites. All HTTP goes through `ApiClientLibrary.Send API Request`.
3. Soft assertions: `ValidationLibrary` collects all errors and raises once at end of `Validate Response` — do not add hard `Should Be Equal` checks inside validation flows.

## Layer Reference

### Variables (`variables/`)
| File | Purpose |
|------|---------|
| `env.py` | URLs, credentials, browser settings from `.env` |
| `api_config.py` | All endpoint paths + builder functions (`order_by_id()`, etc.) |
| `constants.py` | Timeouts, viewport, order constraints |

### Python Libraries (`libraries/`)
| Path | Class | Scope | Purpose |
|------|-------|-------|---------|
| `api/api_client.py` | `ApiClientLibrary` | GLOBAL | Low-level HTTP wrapper (`requests.Session`) |
| `api/endpoints/login_api.py` | `LoginApiLibrary` | GLOBAL | Login/Logout keywords |
| `api/endpoints/products_api.py` | `ProductsApiLibrary` | GLOBAL | Products CRUD |
| `api/endpoints/customers_api.py` | `CustomersApiLibrary` | GLOBAL | Customers CRUD |
| `api/endpoints/orders_api.py` | `OrdersApiLibrary` | GLOBAL | Orders CRUD + delivery/status/receive/comments/managers |
| `stores/entity_store_library.py` | `EntityStoreLibrary` | TEST | Tracks created entity IDs for cleanup |
| `utils/data_generator_library.py` | `DataGeneratorLibrary` | TEST | Faker-based test data generation |
| `utils/validation_library.py` | `ValidationLibrary` | GLOBAL | Soft-assertion response validation + JSON schema |
| `mock/mock_library.py` | `MockLibrary` | SUITE | Network interception via JS extension |

### Resource Files (`resources/`)
| Path | Key Keywords |
|------|-------------|
| `api/service/login_service.resource` | `Get Admin Token` |
| `api/service/products_service.resource` | `Create Product And Track`, `Bulk Create Products` |
| `api/service/customers_service.resource` | `Create Customer And Track` |
| `api/service/orders_service.resource` | `Create Order And Track`, `Create Order With Delivery And Track`, `Full Delete Entities` |
| `api/facades/orders_facade.resource` | `Create Full Order Lifecycle` (customer→product→order→delivery→processing→receive) |

### Data Layer (`data/`)
| Path | Purpose |
|------|---------|
| `models/` | Pydantic models: `ProductData`, `CustomerData`, `OrderData`, `DeliveryData`, `Order`, etc. |
| `enums/` | `Country`, `Manufacturer`, `OrderStatus`, `DeliveryCondition`, `errors` |
| `schemas/` | AJV-style jsonschema dicts per domain (core, products, customers, orders, delivery, login, users) |
| `ddt/` | CSV files for data-driven tests (positive/negative per domain) |

## DDT Approach
- **Inline `Test Template` tables** for small case sets (≤10 cases) — keep in `.robot` file
- **`DataDriver` with CSV from `data/ddt/`** for large or externally-managed datasets

## Cleanup Pattern
```robotframework
[Teardown]    Full Delete Entities    ${TOKEN}
```
`Full Delete Entities` deletes in dependency order: orders → products → customers.
`EntityStoreLibrary` (TEST scope) tracks IDs during the test.

## Linting & Formatting
```bash
ruff check libraries/ variables/ data/      # lint Python
ruff format libraries/ variables/ data/     # format Python
mypy libraries/ variables/ data/            # type check
robocop resources/ tests/                   # lint Robot files
robotidy resources/ tests/                  # format Robot files
```
Pre-commit hooks run these automatically on staged files.

## Implementation Status
| Phase | Scope | Status |
|-------|-------|--------|
| 1–10 | Infrastructure, API libraries, service resources, entity store, API tests | ✅ Done |
| 11–13 | UI base page, domain pages, UI services | ✅ Done |
| 14 | Mock / network interception library | ✅ Done |
| 15–17 | Auth setup, UI tests, integration tests | ✅ Done |
| 18–20 | Reporting, CI/CD, final polish & documentation | ✅ Done |
