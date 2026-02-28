# Implementation Plan — Robot Framework + Browser Library (Playwright)

> **Reference:** [`STACK_ROBOT.md`](./STACK_ROBOT.md) (full architecture & library spec)
> **Original (Python/pytest):** [`IMPLEMENTATION_PLAN_PYTHON.md`](./IMPLEMENTATION_PLAN_PYTHON.md)
> **Original (TypeScript):** [`STACK.md`](./STACK.md)
> **Dev environment:** [`sales-portal/`](./sales-portal/) (backend + frontend + Docker Compose)
> **Approach:** Bottom-up — infrastructure first, then configuration, data, API libraries, UI resources, tests last

---

## Key Decisions (documented upfront)

### Decision 1 — Browser Library (Playwright), not SeleniumLibrary

Use `robotframework-browser` (wraps Playwright) for UI tests. This aligns with the Playwright-based TS and Python projects and provides:

- Native network interception (`Mock Request`, `Mock Response`) for integration tests
- Storage state injection for session-scoped auth (no repeated login in UI tests)
- Built-in auto-wait, tracing, screenshots, and video recording

### Decision 2 — `RequestsLibrary` for API tests, not Browser Library HTTP

Use `robotframework-requests` (`RequestsLibrary`) for API tests. It provides clean RF keywords (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) that map directly to the HTTP verbs without needing a browser context. A thin Python wrapper library (`ApiClientLibrary`) adds Allure attachment and secret masking on top.

### Decision 3 — Hybrid DDT approach

- **Inline `Test Template` tables** for small, code-first case tables (≤ 10 cases).
- **`DataDriver` with CSV files** for large datasets or cases that need to be managed outside of code.

### Decision 4 — Python Keyword Libraries for complex logic

All logic that requires type safety, data generation, schema validation, or multi-step orchestration goes in **Python keyword libraries** under `libraries/`. Robot Framework `.resource` files only compose existing keywords — they contain no imperative logic.

### Decision 5 — Soft assertions via `pytest-check` pattern in keyword library

`ValidationLibrary` uses a collected-errors approach: it gathers all assertion failures and raises a single aggregated error at the end of `Validate Response`, mirroring `pytest-check`'s soft assertion behaviour.

---

## Dev Environment Reference

Run the application under test locally:

```bash
cd sales-portal
docker-compose up --build
```

| Service       | URL                              |
| ------------- | -------------------------------- |
| Frontend      | `http://localhost:8585`          |
| Backend API   | `http://localhost:8686`          |
| Swagger       | `http://localhost:8686/api/docs` |
| Mongo Express | `http://localhost:8081`          |

Default admin credentials: `admin@example.com` / `admin123`

---

## Table of Contents

- [Phase 1 — Project Skeleton & Tooling](#phase-1--project-skeleton--tooling)
- [Phase 2 — Configuration & Environment](#phase-2--configuration--environment)
- [Phase 3 — Data Layer (Models, Enums, Schemas, Generators)](#phase-3--data-layer-models-enums-schemas-generators)
- [Phase 4 — Utility Keyword Libraries](#phase-4--utility-keyword-libraries)
- [Phase 5 — API Client Library](#phase-5--api-client-library)
- [Phase 6 — API Endpoint Keyword Libraries](#phase-6--api-endpoint-keyword-libraries)
- [Phase 7 — API Service & Facade Resources](#phase-7--api-service--facade-resources)
- [Phase 8 — First API Tests (Login + Products)](#phase-8--first-api-tests-login--products)
- [Phase 9 — Remaining API Tests](#phase-9--remaining-api-tests)
- [Phase 10 — Entity Store Library & Cleanup Pattern](#phase-10--entity-store-library--cleanup-pattern)
- [Phase 11 — UI Base Layer (Page Resources)](#phase-11--ui-base-layer-page-resources)
- [Phase 12 — UI Domain Page Resources](#phase-12--ui-domain-page-resources)
- [Phase 13 — UI Service Resources](#phase-13--ui-service-resources)
- [Phase 14 — Mock / Network Interception Library](#phase-14--mock--network-interception-library)
- [Phase 15 — Auth Setup & UI Test Infrastructure](#phase-15--auth-setup--ui-test-infrastructure)
- [Phase 16 — UI Tests](#phase-16--ui-tests)
- [Phase 17 — Integration Tests (Mock-based)](#phase-17--integration-tests-mock-based)
- [Phase 18 — Reporting & Notifications](#phase-18--reporting--notifications)
- [Phase 19 — CI/CD Pipelines](#phase-19--cicd-pipelines)
- [Phase 20 — Final Polish & Documentation](#phase-20--final-polish--documentation)

---

## Phase 1 — Project Skeleton & Tooling

**Goal:** Empty project with all tooling configured; `robot --dryrun tests/` and `mypy`/`robocop` pass.

### Step 1.1 — Initialise repository & Python environment

```bash
mkdir sales-portal-robot-tests && cd sales-portal-robot-tests
git init

# Create virtual environment
python3.12 -m venv .venv
source .venv/bin/activate
```

### Step 1.2 — Create `pyproject.toml`

Define project metadata, all dependencies, and tool configurations:

```toml
[project]
name = "sales-portal-robot-tests"
version = "1.0.0"
requires-python = ">=3.12"
dependencies = [
    "robotframework>=7.0",
    "robotframework-browser>=18.0",
    "robotframework-requests>=0.9",
    "robotframework-datadriver>=1.11",
    "robotframework-jsonlibrary>=0.5",
    "allure-robotframework>=2.13",
    "requests>=2.32",
    "faker>=33.0",
    "pydantic>=2.10",
    "python-dotenv>=1.1",
    "jsonschema>=4.23",
    "pymongo>=4.10",
    "python-telegram-bot>=21.0",
    "robotframework-pabot>=2.18",
]

[project.optional-dependencies]
dev = [
    "ruff>=0.8",
    "mypy>=1.14",
    "pre-commit>=4.0",
    "robocop>=5.0",
    "robotidy>=4.15",
]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["."]
include = ["libraries*", "variables*", "data*"]

[tool.mypy]
strict = true
python_version = "3.12"
plugins = ["pydantic.mypy"]
ignore_missing_imports = true
exclude = [".venv"]

[tool.ruff]
line-length = 120
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "W", "I", "UP", "B", "SIM", "RUF"]
```

### Step 1.3 — Install dependencies & initialize Browser Library

```bash
pip install -e ".[dev]"

# Initialize Browser Library — downloads Playwright browsers
rfbrowser init

# Or install only Chromium
rfbrowser init chromium
```

### Step 1.4 — Create `robot.toml` (RF global configuration)

```toml
# robot.toml
[default]
variablefiles = ["variables/env.py"]
outputdir    = "results"
loglevel     = "INFO"
# Global listener for Allure reporting (enable in CI or via CLI flag)
# listener     = "allure_robotframework"
```

### Step 1.5 — Create initial directory structure

Create all directories and empty `__init__.py` files for Python packages:

```
libraries/
├── __init__.py
├── api/
│   ├── __init__.py
│   ├── api_client.py            (stub)
│   ├── response.py              (stub)
│   └── endpoints/
│       ├── __init__.py
│       ├── login_api_library.py     (stub)
│       ├── products_api_library.py  (stub)
│       ├── customers_api_library.py (stub)
│       ├── orders_api_library.py    (stub)
│       └── notifications_api_library.py (stub)
├── ui/
│   ├── __init__.py
│   └── browser_helpers.py       (stub)
├── mock/
│   ├── __init__.py
│   └── mock_library.py          (stub)
├── stores/
│   ├── __init__.py
│   └── entity_store_library.py  (stub)
└── utils/
    ├── __init__.py
    ├── validation_library.py    (stub)
    ├── data_generator_library.py (stub)
    ├── date_utils_library.py    (stub)
    └── notifications/
        ├── __init__.py
        └── telegram_library.py  (stub)

variables/
├── env.py
├── api_config.py
└── constants.py

resources/
├── api/
│   ├── service/
│   │   ├── login_service.resource
│   │   ├── products_service.resource
│   │   ├── customers_service.resource
│   │   └── orders_service.resource
│   └── facades/
│       └── orders_facade.resource
└── ui/
    ├── pages/
    │   ├── base_page.resource
    │   ├── sales_portal_page.resource
    │   ├── base_modal.resource
    │   ├── login_page.resource
    │   ├── home_page.resource
    │   ├── products/
    │   ├── customers/
    │   └── orders/
    └── service/
        └── (service resource files)

data/
├── schemas/
│   ├── core_schema.py
│   ├── products/
│   ├── customers/
│   ├── orders/
│   ├── delivery/
│   ├── login/
│   └── users/
├── models/
│   ├── __init__.py
│   ├── product.py
│   ├── customer.py
│   └── order.py
├── enums/
│   ├── __init__.py
│   ├── country.py
│   ├── manufacturers.py
│   ├── order_status.py
│   └── delivery_condition.py
├── ddt/
│   └── (CSV files — populated in Phase 3)
└── generators/
    ├── __init__.py
    ├── generate_product_data.py
    ├── generate_customer_data.py
    ├── generate_delivery_data.py
    └── generate_order_data.py

tests/
├── api/
│   ├── products/
│   ├── customers/
│   └── orders/
└── ui/
    ├── auth_setup.robot
    ├── orders/
    └── integration/

src/.auth/   (gitignored — generated storage state)
results/     (gitignored — RF output)
allure-results/ (gitignored)
scripts/
└── notify_telegram.py
```

### Step 1.6 — Configure `.pre-commit-config.yaml`

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
        args: [--fix]
        files: "^(libraries|variables|data)/"
      - id: ruff-format
        files: "^(libraries|variables|data)/"

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.14.0
    hooks:
      - id: mypy
        files: "^(libraries|variables|data)/"
        additional_dependencies: [pydantic>=2.10, robotframework>=7.0]

  - repo: https://github.com/MarketSquare/robotframework-robocop
    rev: 5.0.0
    hooks:
      - id: robocop
        files: '\.(robot|resource)$'

  - repo: https://github.com/MarketSquare/robotidy
    rev: 4.15.0
    hooks:
      - id: robotidy
        files: '\.(robot|resource)$'
```

```bash
pre-commit install
```

### Step 1.7 — Create `.gitignore`

```
.venv/
__pycache__/
*.pyc
.mypy_cache/
.pytest_cache/
results/
allure-results/
allure-report/
src/.auth/
.env
.env.dev
dist/
*.egg-info/
node_modules/
```

### Step 1.8 — Verification checkpoint

```bash
# Robot Framework dry run (no tests yet — should show "0 suites, 0 tests")
robot --dryrun tests/ 2>&1 | head -20

# Type checking on stubs
mypy libraries/ variables/ data/

# Lint Python files
ruff check libraries/ variables/ data/

# Lint RF files (no .robot files yet — should pass vacuously)
robocop resources/ tests/
```

---

## Phase 2 — Configuration & Environment

**Goal:** `.env` loading works; all RF variable files importable; endpoint constants available.

### Step 2.1 — Create `.env` template files

```bash
# .env (local Docker Compose defaults)
SALES_PORTAL_URL=http://localhost:8585
SALES_PORTAL_API_URL=http://localhost:8686
USER_NAME=admin@example.com
USER_PASSWORD=admin123
MANAGER_IDS=["id1","id2"]
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
STORAGE_STATE_PATH=src/.auth/user.json
HEADLESS=True
BROWSER=chromium
```

```bash
# .env.dist (committed template without secrets)
SALES_PORTAL_URL=
SALES_PORTAL_API_URL=
USER_NAME=
USER_PASSWORD=
MANAGER_IDS=[]
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
STORAGE_STATE_PATH=src/.auth/user.json
HEADLESS=True
BROWSER=chromium
```

### Step 2.2 — Implement `variables/env.py`

Robot Framework automatically calls this as a variable file. All module-level names that don't start with `_` become RF variables.

```python
# variables/env.py
"""RF Variable file — loads .env and exports environment variables as RF variables."""
import json
import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv(".env.dev" if os.getenv("TEST_ENV") == "dev" else ".env")

SALES_PORTAL_URL: str = os.environ["SALES_PORTAL_URL"]
SALES_PORTAL_API_URL: str = os.environ["SALES_PORTAL_API_URL"]
USER_NAME: str = os.environ["USER_NAME"]
USER_PASSWORD: str = os.environ["USER_PASSWORD"]
MANAGER_IDS: list[str] = json.loads(os.environ.get("MANAGER_IDS", "[]"))
STORAGE_STATE_PATH: str = os.getenv("STORAGE_STATE_PATH", "src/.auth/user.json")
HEADLESS: bool = os.getenv("HEADLESS", "True").lower() == "true"
BROWSER: str = os.getenv("BROWSER", "chromium")
TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")

CREDENTIALS: dict[str, str] = {"username": USER_NAME, "password": USER_PASSWORD}
```

### Step 2.3 — Implement `variables/api_config.py`

```python
# variables/api_config.py
"""RF Variable file — API endpoint URL constants and builder functions."""
import os
from dotenv import load_dotenv

load_dotenv(".env.dev" if os.getenv("TEST_ENV") == "dev" else ".env")

_BASE_URL: str = os.environ["SALES_PORTAL_API_URL"]

# Static endpoint constants (become RF variables when loaded as variable file)
LOGIN: str = f"{_BASE_URL}/api/login"
LOGOUT: str = f"{_BASE_URL}/api/logout"
PRODUCTS: str = f"{_BASE_URL}/api/products"
PRODUCTS_ALL: str = f"{_BASE_URL}/api/products/all"
CUSTOMERS: str = f"{_BASE_URL}/api/customers"
CUSTOMERS_ALL: str = f"{_BASE_URL}/api/customers/all"
ORDERS: str = f"{_BASE_URL}/api/orders"
NOTIFICATIONS: str = f"{_BASE_URL}/api/notifications"
NOTIFICATIONS_MARK_ALL_READ: str = f"{_BASE_URL}/api/notifications/mark-all-read"
METRICS: str = f"{_BASE_URL}/api/metrics"
USERS: str = f"{_BASE_URL}/api/users"

# Parameterised endpoint builder functions (called from keyword libraries)
def product_by_id(product_id: str) -> str: return f"{PRODUCTS}/{product_id}"
def customer_by_id(customer_id: str) -> str: return f"{CUSTOMERS}/{customer_id}"
def customer_orders(customer_id: str) -> str: return f"{CUSTOMERS}/{customer_id}/orders"
def order_by_id(order_id: str) -> str: return f"{ORDERS}/{order_id}"
def order_delivery(order_id: str) -> str: return f"{ORDERS}/{order_id}/delivery"
def order_status(order_id: str) -> str: return f"{ORDERS}/{order_id}/status"
def order_receive(order_id: str) -> str: return f"{ORDERS}/{order_id}/receive"
def order_comments(order_id: str) -> str: return f"{ORDERS}/{order_id}/comments"
def order_comment_by_id(order_id: str, comment_id: str) -> str:
    return f"{ORDERS}/{order_id}/comments/{comment_id}"
def assign_manager(order_id: str, manager_id: str) -> str:
    return f"{ORDERS}/{order_id}/assign-manager/{manager_id}"
def unassign_manager(order_id: str) -> str:
    return f"{ORDERS}/{order_id}/unassign-manager"
def notification_read(notification_id: str) -> str:
    return f"{NOTIFICATIONS}/{notification_id}/read"
def user_by_id(user_id: str) -> str: return f"{USERS}/{user_id}"
def user_password(user_id: str) -> str: return f"{USERS}/password/{user_id}"
```

### Step 2.4 — Implement `variables/constants.py`

```python
# variables/constants.py
"""RF Variable file — timeouts, viewport, and other constants."""

# Timeouts (milliseconds — Browser Library uses ms)
DEFAULT_TIMEOUT: int = 30_000
SHORT_TIMEOUT: int = 5_000
LONG_TIMEOUT: int = 60_000
SPINNER_TIMEOUT: int = 10_000
TOAST_TIMEOUT: int = 5_000

# Viewport
VIEWPORT_WIDTH: int = 1920
VIEWPORT_HEIGHT: int = 1080

# Orders
MAX_PRODUCTS_PER_ORDER: int = 5
MIN_PRODUCTS_PER_ORDER: int = 1
```

### Step 2.5 — Update `robot.toml` to load all variable files

```toml
[default]
variablefiles = [
    "variables/env.py",
    "variables/api_config.py",
    "variables/constants.py",
]
outputdir = "results"
loglevel  = "INFO"
```

### Step 2.6 — Verification checkpoint

```bash
# Verify variable files are loadable
python -c "import variables.env, variables.api_config, variables.constants; print('OK')"

# Check that robot can load variable files (use a dummy test to verify)
robot --variable SALES_PORTAL_URL:http://localhost:8585 --dryrun tests/ 2>&1 | head -10
```

---

## Phase 3 — Data Layer (Models, Enums, Schemas, Generators)

**Goal:** All Pydantic models, enums, JSON schemas, and data generators implemented; importable from `data/`.

### Step 3.1 — Implement enums (`data/enums/`)

Create Python `StrEnum` classes mirroring the backend's `enums.ts`:

```python
# data/enums/country.py
from enum import StrEnum

class Country(StrEnum):
    USA = "USA"
    CANADA = "Canada"
    BELARUS = "Belarus"
    UKRAINE = "Ukraine"
    GERMANY = "Germany"
    FRANCE = "France"
    GREAT_BRITAIN = "Great Britain"
    RUSSIA = "Russia"
```

Apply the same pattern for:

- `data/enums/manufacturers.py` → `Manufacturers(StrEnum)` (Apple, Samsung, Google, Microsoft, Sony, Xiaomi, Amazon, Tesla)
- `data/enums/order_status.py` → `OrderStatus(StrEnum)` (Draft, In Process, Partially Received, Received, Canceled)
- `data/enums/delivery_condition.py` → `DeliveryCondition(StrEnum)` (Delivery, Pickup)
- `data/enums/errors.py` → `ErrorMessages` — validation error message constants (match backend)

Export all enums from `data/enums/__init__.py`.

### Step 3.2 — Implement Pydantic models (`data/models/`)

```python
# data/models/product.py
from pydantic import BaseModel

class ProductData(BaseModel):
    name: str
    amount: int
    price: int
    manufacturer: str
    notes: str | None = None

class Product(ProductData):
    id: str   # _id from backend
```

Apply the same pattern for:

- `data/models/customer.py` → `CustomerData`, `Customer`
- `data/models/order.py` → `OrderData`, `Order`, `OrderProduct`, `Delivery`, `Comment`
- `data/models/credentials.py` → `Credentials`
- `data/models/user.py` → `User`

### Step 3.3 — Implement JSON schemas (`data/schemas/`)

Port JSON schemas from the pytest project (`src/sales_portal_tests/data/schemas/`). These are Python dicts.

Key schema files to create:

- `data/schemas/core_schema.py` — shared `is_success`, `error_message` fields
- `data/schemas/products/create_product_schema.py`
- `data/schemas/products/get_product_schema.py`
- `data/schemas/customers/create_customer_schema.py`
- `data/schemas/orders/create_order_schema.py`
- `data/schemas/delivery/delivery_schema.py`
- `data/schemas/login/login_schema.py`

Reference the existing schemas in `src/sales_portal_tests/data/schemas/` in this repo.

### Step 3.4 — Implement data generators (`data/generators/`)

```python
# data/generators/generate_product_data.py
from faker import Faker
from data.enums.manufacturers import Manufacturers
from data.models.product import ProductData
import random

faker = Faker()

def generate_product_data(
    name: str | None = None,
    amount: int | None = None,
    price: int | None = None,
    manufacturer: str | None = None,
) -> ProductData:
    return ProductData(
        name=name or faker.unique.bothify(text="Product ????####"),
        amount=amount if amount is not None else random.randint(1, 100),
        price=price if price is not None else random.randint(1, 9999),
        manufacturer=manufacturer or random.choice(list(Manufacturers)),
    )
```

Apply the same pattern for:

- `data/generators/generate_customer_data.py` → `generate_customer_data()`
- `data/generators/generate_delivery_data.py` → `generate_delivery_data()`
- `data/generators/generate_order_data.py` → `generate_order_data(customer_id, product_ids)`

### Step 3.5 — Create DDT CSV files (`data/ddt/`)

Create CSV files for data-driven API tests used by `DataDriver`. Each CSV has a header row with argument names matching the keyword parameter names.

Example: `data/ddt/create_product_positive.csv`

```csv
case_name,name,amount,price,manufacturer,expected_status
All valid fields — Samsung,Samsung Phone,10,999,Samsung,201
All valid fields — Apple,Apple Watch,5,599,Apple,201
Max price value,Product Alpha123,1,99999,Google,201
Max amount value,Product Beta456,999,1,Microsoft,201
```

Example: `data/ddt/create_product_negative.csv`

```csv
case_name,name,amount,price,manufacturer,expected_status,expected_error
Empty name,${EMPTY},10,999,Samsung,400,Incorrect request body
Invalid manufacturer,Phone,10,999,Unknown,400,Incorrect request body
Name too short,AB,10,999,Sony,400,Incorrect request body
Amount as string,Product Valid,abc,999,Google,400,Incorrect request body
```

Create similar CSVs for customers and orders.

### Step 3.6 — Verification checkpoint

```bash
python -c "
from data.enums.country import Country
from data.enums.manufacturers import Manufacturers
from data.models.product import ProductData
from data.generators.generate_product_data import generate_product_data
p = generate_product_data()
print(p)
"
mypy data/
ruff check data/
```

---

## Phase 4 — Utility Keyword Libraries

**Goal:** Validation, date, and notification utilities implemented as RF keyword libraries.

### Step 4.1 — Implement `ValidationLibrary` (`libraries/utils/validation_library.py`)

```python
# libraries/utils/validation_library.py
"""RF keyword library for API response validation."""
from robot.api.deco import keyword, library
import allure
import jsonschema
from libraries.api.response import ApiResponse

@library(scope="GLOBAL")
class ValidationLibrary:

    @keyword("Validate Response")
    @allure.step("Validate response: status={expected_status}")
    def validate_response(
        self,
        response: ApiResponse,
        expected_status: int,
        schema: dict | None = None,
    ) -> None:
        """
        Soft-assert status, IsSuccess, and optional JSON schema.
        Collects all failures and raises AssertionError with the full list.
        """
        errors: list[str] = []

        if response.status != expected_status:
            errors.append(
                f"Expected status {expected_status}, got {response.status}. "
                f"Body: {response.body}"
            )

        if expected_status < 400:
            if not response.body.get("IsSuccess", False):
                errors.append(f"Expected IsSuccess=True, got: {response.body.get('IsSuccess')}")
            error_msg = response.body.get("ErrorMessage")
            if error_msg is not None:
                errors.append(f"Expected ErrorMessage=None, got: '{error_msg}'")
        else:
            if response.body.get("IsSuccess", True):
                errors.append(f"Expected IsSuccess=False on error, got: {response.body.get('IsSuccess')}")

        if schema is not None:
            try:
                jsonschema.validate(instance=response.body, schema=schema)
            except jsonschema.ValidationError as e:
                errors.append(f"JSON schema validation failed: {e.message}")

        if errors:
            raise AssertionError("Response validation failed:\n" + "\n".join(f"  - {e}" for e in errors))

    @keyword("Validate Json Schema")
    def validate_json_schema(self, body: dict, schema: dict) -> None:
        """Validate a dict against a JSON Schema dict."""
        jsonschema.validate(instance=body, schema=schema)
```

### Step 4.2 — Implement `DataGeneratorLibrary` (`libraries/utils/data_generator_library.py`)

Python keyword library that exposes data generator functions as RF keywords:

```python
@library(scope="TEST")
class DataGeneratorLibrary:

    @keyword("Generate Product Data")
    def generate_product_data(self, **overrides: str) -> dict:
        """Returns a product data dict with optional field overrides."""
        from data.generators.generate_product_data import generate_product_data
        data = generate_product_data(**overrides)
        return data.model_dump()

    @keyword("Generate Customer Data")
    def generate_customer_data(self, **overrides: str) -> dict: ...

    @keyword("Generate Delivery Data")
    def generate_delivery_data(self, **overrides: str) -> dict: ...

    @keyword("Generate Order Data")
    def generate_order_data(self, customer_id: str, product_ids: list[str]) -> dict: ...
```

### Step 4.3 — Implement `DateUtilsLibrary` (`libraries/utils/date_utils_library.py`)

```python
@library(scope="GLOBAL")
class DateUtilsLibrary:

    @keyword("Format Date For API")
    def format_date_for_api(self, date: datetime | None = None, days_offset: int = 7) -> str:
        """Returns a date string formatted as YYYY/MM/DD (backend format)."""
        target = date or (datetime.now() + timedelta(days=days_offset))
        return target.strftime("%Y/%m/%d")
```

### Step 4.4 — Implement `TelegramLibrary` (`libraries/utils/notifications/telegram_library.py`)

```python
@library(scope="GLOBAL")
class TelegramLibrary:

    @keyword("Send Telegram Message")
    def send_telegram_message(self, message: str, token: str = "", chat_id: str = "") -> None:
        """Sends a Telegram message. Skips silently if token/chat_id are not set."""
        import asyncio
        from telegram import Bot
        _token = token or os.getenv("TELEGRAM_BOT_TOKEN", "")
        _chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID", "")
        if not _token or not _chat_id:
            return
        asyncio.run(Bot(token=_token).send_message(chat_id=_chat_id, text=message))
```

### Step 4.5 — Verification checkpoint

```bash
mypy libraries/utils/
ruff check libraries/utils/

# Quick import check
python -c "
from libraries.utils.validation_library import ValidationLibrary
from libraries.utils.data_generator_library import DataGeneratorLibrary
print('OK')
"
```

---

## Phase 5 — API Client Library

**Goal:** `ApiClientLibrary` wraps `requests.Session`; attaches request/response JSON to Allure; masks secrets.

### Step 5.1 — Implement `ApiResponse` dataclass (`libraries/api/response.py`)

```python
# libraries/api/response.py
from dataclasses import dataclass

@dataclass
class ApiResponse:
    status: int
    body: dict
    headers: dict[str, str]
    text: str
```

### Step 5.2 — Implement `ApiClientLibrary` (`libraries/api/api_client.py`)

```python
# libraries/api/api_client.py
import json
import re
import allure
import requests
from robot.api.deco import keyword, library
from libraries.api.response import ApiResponse

_SECRET_PATTERN = re.compile(r'"(password|token|Authorization)":\s*"[^"]*"', re.IGNORECASE)

def _mask_secrets(text: str) -> str:
    return _SECRET_PATTERN.sub(lambda m: f'"{m.group(1)}": "***"', text)

@library(scope="SESSION")
class ApiClientLibrary:
    """Low-level HTTP client keyword library — wraps requests.Session."""

    def __init__(self) -> None:
        self._session = requests.Session()

    @keyword("Send API Request")
    def send_api_request(
        self,
        method: str,
        url: str,
        token: str | None = None,
        body: dict | None = None,
        params: dict | None = None,
    ) -> ApiResponse:
        headers: dict[str, str] = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        with allure.step(f"{method.upper()} {url}"):
            resp = self._session.request(
                method=method.upper(),
                url=url,
                headers=headers,
                json=body,
                params=params,
            )
            response = ApiResponse(
                status=resp.status_code,
                body=resp.json() if resp.text else {},
                headers=dict(resp.headers),
                text=resp.text,
            )
            allure.attach(
                _mask_secrets(json.dumps(body, indent=2) if body else ""),
                name="Request Body",
                attachment_type=allure.attachment_type.JSON,
            )
            allure.attach(
                _mask_secrets(json.dumps(response.body, indent=2)),
                name=f"Response {response.status}",
                attachment_type=allure.attachment_type.JSON,
            )
        return response
```

### Step 5.3 — Verification checkpoint

```bash
mypy libraries/api/
ruff check libraries/api/
python -c "from libraries.api.api_client import ApiClientLibrary; print('OK')"
```

---

## Phase 6 — API Endpoint Keyword Libraries

**Goal:** One `@library` class per domain, each `@keyword` maps to one API endpoint.

### Step 6.1 — Implement `LoginApiLibrary` (`libraries/api/endpoints/login_api_library.py`)

```python
from robot.api.deco import keyword, library
import allure
from libraries.api.api_client import ApiClientLibrary
from libraries.api.response import ApiResponse
import variables.api_config as api

@library(scope="SESSION")
class LoginApiLibrary:

    def __init__(self, client: ApiClientLibrary) -> None:
        self._client = client

    @keyword("Login User")
    @allure.step("POST /api/login — Login user")
    def login_user(self, username: str, password: str) -> ApiResponse:
        return self._client.send_api_request(
            "POST", api.LOGIN, body={"username": username, "password": password}
        )

    @keyword("Logout User")
    @allure.step("POST /api/logout — Logout user")
    def logout_user(self, token: str) -> ApiResponse:
        return self._client.send_api_request("POST", api.LOGOUT, token=token)
```

### Step 6.2 — Implement `ProductsApiLibrary` (`libraries/api/endpoints/products_api_library.py`)

Provide these keywords (each decorated with `@keyword` and `@allure.step`):

- `Create Product` — POST `/api/products`
- `Get Product By Id` — GET `/api/products/:id`
- `Get All Products` — GET `/api/products/all`
- `Get Products List` — GET `/api/products` (with optional query params)
- `Update Product` — PUT `/api/products/:id`
- `Delete Product` — DELETE `/api/products/:id`

### Step 6.3 — Implement `CustomersApiLibrary`

Provide these keywords:

- `Create Customer`, `Get Customer By Id`, `Get All Customers`, `Get Customers List`, `Update Customer`, `Delete Customer`

### Step 6.4 — Implement `OrdersApiLibrary`

Provide these keywords:

- `Create Order`, `Get Order By Id`, `Get All Orders`, `Update Order`, `Delete Order`
- `Add Order Delivery`, `Update Order Status`, `Receive Order Products`
- `Add Order Comment`, `Delete Order Comment`
- `Assign Manager To Order`, `Unassign Manager From Order`

### Step 6.5 — Implement `NotificationsApiLibrary`

Provide these keywords:

- `Get Notifications`, `Mark Notification As Read`, `Mark All Notifications As Read`

### Step 6.6 — Verification checkpoint

```bash
mypy libraries/api/endpoints/
ruff check libraries/api/endpoints/

# Verify each library is importable
python -c "
from libraries.api.endpoints.login_api_library import LoginApiLibrary
from libraries.api.endpoints.products_api_library import ProductsApiLibrary
from libraries.api.endpoints.customers_api_library import CustomersApiLibrary
from libraries.api.endpoints.orders_api_library import OrdersApiLibrary
print('All API libraries OK')
"
```

---

## Phase 7 — API Service & Facade Resources

**Goal:** High-level `.resource` files composing endpoint keywords into business flows.

### Step 7.1 — Implement `login_service.resource`

```robot
*** Settings ***
Library    libraries/api/api_client.py    WITH NAME    ApiClient
Library    libraries/api/endpoints/login_api_library.py    WITH NAME    LoginApi

*** Keywords ***
Get Admin Token
    [Documentation]    Authenticates with admin credentials and returns the Bearer token.
    ${response}=    Login Api.Login User    username=${USER_NAME}    password=${USER_PASSWORD}
    Should Be Equal As Integers    ${response.status}    200
    ${token}=    Set Variable    ${response.headers["Authorization"]}
    RETURN    ${token}
```

### Step 7.2 — Implement `products_service.resource`

Provide these keywords (composing `ProductsApiLibrary` + `ValidationLibrary` + `EntityStoreLibrary`):

- `Create Product And Track` — creates a product, validates 201, tracks ID for cleanup
- `Create Product With Data And Track` — same but accepts explicit `ProductData` dict
- `Delete Product By Id` — deletes a product, validates 200
- `Bulk Create Products` — creates N products in a loop, returns list of Product dicts

### Step 7.3 — Implement `customers_service.resource`

Similar to `products_service.resource`:

- `Create Customer And Track`
- `Create Customer With Data And Track`
- `Delete Customer By Id`

### Step 7.4 — Implement `orders_service.resource`

- `Create Order And Track` — creates order with generated customer + product, tracks all IDs
- `Create Order With Delivery And Track` — creates order and adds delivery
- `Delete Order By Id`
- `Full Delete Entities` — teardown keyword: deletes tracked orders → products → customers

```robot
*** Keywords ***
Full Delete Entities
    [Documentation]    Teardown keyword: deletes all tracked entities in correct order.
    [Arguments]    ${token}
    ${order_ids}=    Entity Store.Get Tracked Orders
    FOR    ${id}    IN    @{order_ids}
        Orders Api.Delete Order    ${token}    ${id}
    END
    ${product_ids}=    Entity Store.Get Tracked Products
    FOR    ${id}    IN    @{product_ids}
        Products Api.Delete Product    ${token}    ${id}
    END
    ${customer_ids}=    Entity Store.Get Tracked Customers
    FOR    ${id}    IN    @{customer_ids}
        Customers Api.Delete Customer    ${token}    ${id}
    END
    Entity Store.Clear Entity Store
```

### Step 7.5 — Implement `orders_facade.resource`

Cross-domain keyword for full order lifecycle:

- `Create Full Order Lifecycle` — creates customer + product + order → adds delivery → starts processing → receives products

### Step 7.6 — Verification checkpoint

```bash
robocop resources/
robotidy --check resources/
```

---

## Phase 8 — First API Tests (Login + Products)

**Goal:** Login and Products API test suites pass; DDT working; cleanup verified.

### Step 8.1 — Create `tests/api/products/test_create_product.robot`

```robot
*** Settings ***
Documentation    API tests — POST /api/products (Create Product)
Metadata         Suite        API
Metadata         Sub-Suite    Products

Library    libraries/api/api_client.py                          WITH NAME    ApiClient
Library    libraries/api/endpoints/products_api_library.py      WITH NAME    ProductsApi
Library    libraries/utils/validation_library.py                WITH NAME    Validation
Library    libraries/stores/entity_store_library.py             WITH NAME    EntityStore
Library    libraries/utils/data_generator_library.py            WITH NAME    DataGen

Resource   resources/api/service/login_service.resource
Resource   resources/api/service/products_service.resource

Variables  data/schemas/products/create_product_schema.py

Suite Setup     Setup Admin Token
Test Teardown   Full Delete Entities    ${ADMIN_TOKEN}

*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}

*** Test Cases ***
Create Product — Positive: Valid data
    [Tags]    smoke    regression    api    products
    [Documentation]    POST /api/products with valid data returns 201 and correct schema.
    ${data}=       DataGen.Generate Product Data
    ${response}=   ProductsApi.Create Product    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    201    ${CREATE_PRODUCT_SCHEMA}
    EntityStore.Track Product    ${response.body["Product"]["_id"]}

Create Product — Negative: Empty name
    [Tags]    regression    api    products
    ${data}=       DataGen.Generate Product Data    name=${EMPTY}
    ${response}=   ProductsApi.Create Product    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    400

*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
```

### Step 8.2 — Create data-driven create product test using `Test Template`

```robot
*** Settings ***
Library    DataDriver    file=data/ddt/create_product_negative.csv    dialect=excel
Test Template    Create Product With Invalid Data Should Fail

*** Test Cases ***
Create Product — Negative: ${case_name}
    [Tags]    regression    api    products

*** Keywords ***
Create Product With Invalid Data Should Fail
    [Arguments]    ${case_name}    ${name}    ${amount}    ${price}    ${manufacturer}
    ...            ${expected_status}    ${expected_error}
    ${data}=    Create Dict
    ...    name=${name}    amount=${amount}    price=${price}    manufacturer=${manufacturer}
    ${response}=    ProductsApi.Create Product    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    ${expected_status}
    Should Contain    ${response.body["ErrorMessage"]}    ${expected_error}
```

### Step 8.3 — Create `tests/api/products/test_get_product.robot`

Cover:

- GET by valid ID → 200 + schema
- GET by non-existent ID → 404
- GET all products → 200 + schema
- GET products list with query params (sort, filter)

### Step 8.4 — Create `tests/api/products/test_update_product.robot`

Cover:

- PUT valid update → 200
- PUT non-existent product → 404
- PUT invalid data → 400

### Step 8.5 — Create `tests/api/products/test_delete_product.robot`

Cover:

- DELETE existing product → 200
- DELETE non-existent product → 404
- DELETE product assigned to order → 400

### Step 8.6 — Run and verify

```bash
robot --include products --include api -d results tests/api/products/
```

All tests should pass. Verify:

- Allure steps appear in `results/log.html`
- Cleanup removes created products after each test
- DDT cases run as separate test instances

---

## Phase 9 — Remaining API Tests

**Goal:** Complete API test coverage for customers, orders, and sub-resources.

### Step 9.1 — Customers API tests (`tests/api/customers/`)

Create test files mirroring the pytest project's `tests/api/customers/`:

- `test_create_customer.robot` — positive + negative DDT
- `test_get_customer.robot` — get by ID, get list, get all
- `test_update_customer.robot` — valid + invalid updates
- `test_delete_customer.robot` — success + assigned customer error

### Step 9.2 — Orders API tests (`tests/api/orders/`)

Create test files mirroring the pytest project's `tests/api/orders/`:

- `test_create_order.robot`
- `test_get_order.robot`
- `test_update_order.robot`
- `test_delete_order.robot`
- `test_order_delivery.robot` — add delivery, update delivery, invalid delivery data
- `test_order_status.robot` — valid transitions, invalid status values
- `test_order_receive.robot` — receive products, validation
- `test_order_comments.robot` — add comment, delete comment
- `test_assign_manager.robot` — assign, unassign, invalid manager

### Step 9.3 — Shared API test infrastructure

Add a `tests/api/__init__.robot` or shared `conftest.resource` (loaded via `resource` in each suite) that provides:

- `Suite Setup    Setup Admin Token` keyword
- Common imports

### Step 9.4 — Run and verify

```bash
robot --include api --include regression -d results tests/api/
```

---

## Phase 10 — Entity Store Library & Cleanup Pattern

**Goal:** `EntityStoreLibrary` fully implemented; teardown verified across all API test suites.

### Step 10.1 — Implement `EntityStoreLibrary` (`libraries/stores/entity_store_library.py`)

```python
# libraries/stores/entity_store_library.py
"""RF keyword library for tracking entity IDs during test execution."""
from robot.api.deco import keyword, library

@library(scope="TEST")
class EntityStoreLibrary:
    """Per-test entity ID store for deterministic cleanup in teardown."""

    def __init__(self) -> None:
        self._products: set[str] = set()
        self._customers: set[str] = set()
        self._orders: set[str] = set()

    @keyword("Track Product")
    def track_product(self, product_id: str) -> None:
        self._products.add(product_id)

    @keyword("Track Customer")
    def track_customer(self, customer_id: str) -> None:
        self._customers.add(customer_id)

    @keyword("Track Order")
    def track_order(self, order_id: str) -> None:
        self._orders.add(order_id)

    @keyword("Get Tracked Products")
    def get_tracked_products(self) -> list[str]:
        return list(self._products)

    @keyword("Get Tracked Customers")
    def get_tracked_customers(self) -> list[str]:
        return list(self._customers)

    @keyword("Get Tracked Orders")
    def get_tracked_orders(self) -> list[str]:
        return list(self._orders)

    @keyword("Clear Entity Store")
    def clear_entity_store(self) -> None:
        self._products.clear()
        self._customers.clear()
        self._orders.clear()
```

**Scope is `TEST`** — a fresh store instance per test, equivalent to the `function`-scoped `cleanup` fixture in pytest.

### Step 10.2 — Verify cleanup in all API test teardowns

Every API test suite must have:

```robot
Test Teardown    Full Delete Entities    ${ADMIN_TOKEN}
```

Run a single test in isolation and confirm the created entity is deleted.

---

## Phase 11 — UI Base Layer (Page Resources)

**Goal:** `base_page.resource`, `sales_portal_page.resource`, `base_modal.resource` implemented; Browser Library configured.

### Step 11.1 — Implement `resources/ui/pages/base_page.resource`

```robot
*** Settings ***
Library    Browser

*** Keywords ***
Accept Cookies If Present
    [Documentation]    Clicks the cookie accept button if it appears.
    ${visible}=    Run Keyword And Return Status
    ...    Wait For Elements State    css=[data-cy="accept-cookies"]    visible    timeout=${SHORT_TIMEOUT}
    IF    ${visible}
        Click    css=[data-cy="accept-cookies"]
    END

Wait For Spinner To Disappear
    [Documentation]    Waits for loading spinner to become hidden.
    Wait For Elements State    css=.spinner, css=[data-cy="spinner"]
    ...    hidden    timeout=${SPINNER_TIMEOUT}
```

### Step 11.2 — Implement `resources/ui/pages/sales_portal_page.resource`

```robot
*** Settings ***
Resource    base_page.resource

*** Keywords ***
Open Sales Portal Page
    [Arguments]    ${route}
    Go To    ${SALES_PORTAL_URL}/${route}
    Wait For Spinner To Disappear
    Accept Cookies If Present

Wait For Toast Message
    [Arguments]    ${expected_text}=${EMPTY}
    Wait For Elements State    css=.toast, css=[data-cy="toast"]    visible    timeout=${TOAST_TIMEOUT}
    IF    "${expected_text}" != "${EMPTY}"
        Get Text    css=.toast    ==    ${expected_text}
    END
```

### Step 11.3 — Implement `resources/ui/pages/base_modal.resource`

```robot
*** Keywords ***
Wait For Modal To Close
    [Arguments]    ${modal_selector}
    Wait For Elements State    ${modal_selector}    hidden    timeout=${DEFAULT_TIMEOUT}

Confirm Action In Modal
    Click    css=[data-cy="confirm-button"]
    Wait For Spinner To Disappear

Cancel Action In Modal
    Click    css=[data-cy="cancel-button"]
```

### Step 11.4 — Implement `resources/ui/pages/login_page.resource`

```robot
*** Keywords ***
Fill Login Form
    [Arguments]    ${username}    ${password}
    Fill Text    css=[data-cy="username-input"]    ${username}
    Fill Text    css=[data-cy="password-input"]    ${password}

Click Login Button
    Click    css=[data-cy="login-button"]
    Wait For Spinner To Disappear

Login Via UI
    [Arguments]    ${username}=${USER_NAME}    ${password}=${USER_PASSWORD}
    Open Sales Portal Page    #/login
    Fill Login Form    ${username}    ${password}
    Click Login Button
```

### Step 11.5 — Verification checkpoint

```bash
robocop resources/ui/pages/
robotidy --check resources/ui/pages/
```

---

## Phase 12 — UI Domain Page Resources

**Goal:** All domain page resources implemented with correct locators from the real application.

### Step 12.1 — Discover locators from the application

With the Sales Portal running locally:

```bash
cd sales-portal && docker-compose up --build
```

Use Playwright's `page.pause()` or Browser Library's `Browser.Get Page Source` / Browser DevTools to identify `data-cy` attributes, class names, and ARIA roles for all interactive elements.

### Step 12.2 — Implement Products page resources (`resources/ui/pages/products/`)

**`products_list_page.resource`:**

- `Open Products List Page` — navigates to `#/products`
- `Click Add New Product Button` — clicks the create button
- `Search Products` — fills the search input
- `Get Product Table Row` — returns a row locator by product name
- `Click Delete Product` — clicks delete on a specific row
- `Click Edit Product` — clicks edit on a specific row
- `Export Products` — clicks export and waits for download

**`add_new_product_page.resource`:**

- `Fill Product Form` — fills name, amount, price, manufacturer
- `Submit Product Form` — clicks save
- `Verify Product Form Error` — checks inline validation message

**`edit_product_page.resource`:**

- `Open Edit Product Page`
- `Update Product Field` — updates a specific field
- `Submit Edit Form`

**`product_details_modal.resource`:**

- `Open Product Details`
- `Verify Product Details`

### Step 12.3 — Implement Customers page resources (`resources/ui/pages/customers/`)

Mirror the Products structure:

- `customers_list_page.resource`
- `add_new_customer_page.resource`
- `customer_details_modal.resource`

### Step 12.4 — Implement Orders page resources (`resources/ui/pages/orders/`)

This is the most complex domain:

**`orders_list_page.resource`:**

- `Open Orders List Page`
- `Click Create Order Button`
- `Get Order Table Row`
- `Click Order Row` (navigate to details)

**`create_order_modal.resource`:**

- `Select Customer In Modal` — uses autocomplete dropdown
- `Add Product To Order` — searches and adds a product
- `Submit Create Order Form`
- `Verify Order Created` — returns order ID from success toast/redirect

**`order_details_page.resource`:**

- `Open Order Details Page`
- `Verify Order Status`
- `Verify Order Customer`
- `Verify Order Products`
- `Click Add Delivery Button`

**`edit_products_modal.resource`:**

- `Add Product To Existing Order`
- `Remove Product From Order`
- `Submit Edit Products Form`

### Step 12.5 — Verification checkpoint

```bash
robocop resources/ui/
robotidy --check resources/ui/
```

---

## Phase 13 — UI Service Resources

**Goal:** High-level UI service resources that compose page keywords into complete user flows.

### Step 13.1 — Implement `login_ui_service.resource`

```robot
*** Settings ***
Resource    resources/ui/pages/login_page.resource

*** Keywords ***
Login As Admin Via UI
    Login Via UI    ${USER_NAME}    ${USER_PASSWORD}
    Wait For Elements State    css=[data-cy="home-page"]    visible
```

### Step 13.2 — Implement `add_new_product_ui_service.resource`

```robot
*** Keywords ***
Add New Product Via UI
    [Arguments]    ${product_data}
    [Documentation]    Navigates to products, opens create modal, fills and submits form.
    Open Products List Page
    Click Add New Product Button
    Fill Product Form    ${product_data}
    Submit Product Form
    Wait For Toast Message
    RETURN    (product name from the form)

Add New Product With Defaults Via UI
    ${data}=    DataGen.Generate Product Data
    ${name}=    Add New Product Via UI    ${data}
    RETURN    ${name}
```

### Step 13.3 — Implement remaining UI service resources

Create resources for:

- `edit_product_ui_service.resource` — `Edit Product Via UI`, `Verify Product Updated`
- `products_list_ui_service.resource` — `Filter Products Via UI`, `Export And Download CSV`
- `add_new_customer_ui_service.resource` — `Add New Customer Via UI`
- `customers_list_ui_service.resource`
- `order_details_ui_service.resource` — `Fill Order Delivery Via UI`, `Change Order Status Via UI`
- `assign_manager_ui_service.resource` — `Assign Manager Via UI`, `Unassign Manager Via UI`
- `comments_ui_service.resource` — `Add Comment Via UI`, `Delete Comment Via UI`

### Step 13.4 — Verification checkpoint

```bash
robocop resources/ui/service/
```

---

## Phase 14 — Mock / Network Interception Library

**Goal:** `MockLibrary` provides Browser Library route interception keywords for integration tests.

### Step 14.1 — Implement `MockLibrary` (`libraries/mock/mock_library.py`)

```python
# libraries/mock/mock_library.py
"""RF keyword library for network request mocking via Browser Library."""
import json
from robot.api.deco import keyword, library
from robot.libraries.BuiltIn import BuiltIn

@library(scope="TEST")
class MockLibrary:

    def _browser(self):  # type: ignore[return]
        return BuiltIn().get_library_instance("Browser")

    @keyword("Mock Get All Orders")
    def mock_get_all_orders(self, orders: list[dict]) -> None:
        """Intercepts GET /api/orders and returns mock data."""
        self._browser().mock_response(
            url="**/api/orders",
            body=json.dumps({"IsSuccess": True, "ErrorMessage": None, "Orders": orders}),
            status=200,
            headers={"Content-Type": "application/json"},
        )

    @keyword("Mock Get All Products")
    def mock_get_all_products(self, products: list[dict]) -> None:
        self._browser().mock_response(
            url="**/api/products/all",
            body=json.dumps({"IsSuccess": True, "ErrorMessage": None, "Products": products}),
            status=200,
        )

    @keyword("Mock Get Metrics")
    def mock_get_metrics(self, metrics: dict) -> None:
        self._browser().mock_response(
            url="**/api/metrics",
            body=json.dumps({"IsSuccess": True, "ErrorMessage": None, **metrics}),
            status=200,
        )

    @keyword("Clear All Mocks")
    def clear_all_mocks(self) -> None:
        self._browser().unregister_keyword_to_run_on_failure(None)
```

### Step 14.2 — Create mock data builders (`data/generators/mock_data_builders.py`)

```python
# data/generators/mock_data_builders.py
from bson import ObjectId

def build_mock_product(**overrides) -> dict:
    return {
        "_id": str(ObjectId()),
        "name": "Mock Product",
        "amount": 10,
        "price": 100,
        "manufacturer": "Samsung",
        **overrides,
    }

def build_mock_order(**overrides) -> dict:
    return {
        "_id": str(ObjectId()),
        "status": "Draft",
        "customer": build_mock_customer(),
        "products": [],
        "total_price": 0,
        **overrides,
    }
```

---

## Phase 15 — Auth Setup & UI Test Infrastructure

**Goal:** Browser storage state generated once per session; all UI tests reuse it without re-logging in.

### Step 15.1 — Create `tests/ui/auth_setup.robot`

```robot
*** Settings ***
Documentation    Generates browser storage state with admin session.
Library          Browser

Variables        variables/env.py

*** Test Cases ***
Generate Admin Storage State
    [Tags]    setup
    [Documentation]    Logs in as admin and saves browser storage state for reuse in UI tests.
    New Browser    ${BROWSER}    headless=${HEADLESS}
    New Context    viewport={'width': ${VIEWPORT_WIDTH}, 'height': ${VIEWPORT_HEIGHT}}
    New Page       ${SALES_PORTAL_URL}/#/login
    Fill Text      css=[data-cy="username-input"]    ${USER_NAME}
    Fill Text      css=[data-cy="password-input"]    ${USER_PASSWORD}
    Click          css=[data-cy="login-button"]
    Wait For Elements State    css=[data-cy="home-page"]    visible    timeout=15000
    Save Storage State    path=${STORAGE_STATE_PATH}
    Close Browser
```

### Step 15.2 — Create UI test suite setup resource (`resources/ui/ui_suite_setup.resource`)

```robot
*** Settings ***
Library    Browser

Variables    variables/env.py
Variables    variables/constants.py

*** Keywords ***
Setup UI Browser Context
    [Documentation]    Creates a browser context with injected storage state and correct viewport.
    New Browser    ${BROWSER}    headless=${HEADLESS}
    New Context
    ...    storageState=${STORAGE_STATE_PATH}
    ...    viewport={'width': ${VIEWPORT_WIDTH}, 'height': ${VIEWPORT_HEIGHT}}
    New Page    about:blank

Teardown UI Browser Context
    Close Browser
```

### Step 15.3 — CI workflow order

In CI, the auth setup runs first:

```bash
robot --include setup tests/ui/auth_setup.robot
robot --exclude setup --include ui tests/ui/
```

Or via `pabot` with suite ordering:

```bash
pabot --processes 1 tests/ui/auth_setup.robot
pabot --processes 4 --exclude setup --include ui tests/ui/
```

---

## Phase 16 — UI Tests

**Goal:** Complete UI test coverage for the Orders domain (same scope as the pytest project's `tests/ui/orders/`).

### Step 16.1 — Create `tests/ui/orders/test_create_order.robot`

```robot
*** Settings ***
Documentation    UI tests — Create Order modal
Metadata         Suite       UI
Metadata         Sub-Suite   Orders

Library    Browser
Library    libraries/stores/entity_store_library.py    WITH NAME    EntityStore
Library    libraries/utils/data_generator_library.py    WITH NAME    DataGen

Resource   resources/ui/ui_suite_setup.resource
Resource   resources/api/service/login_service.resource
Resource   resources/api/service/products_service.resource
Resource   resources/api/service/customers_service.resource
Resource   resources/api/service/orders_service.resource
Resource   resources/ui/pages/orders/orders_list_page.resource
Resource   resources/ui/pages/orders/create_order_modal.resource
Resource   resources/ui/service/add_new_product_ui_service.resource

Suite Setup       Setup UI Suite
Suite Teardown    Teardown UI Browser Context
Test Teardown     Full Delete Entities    ${ADMIN_TOKEN}

*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}

*** Test Cases ***
Create Order — With 1 Product
    [Tags]    smoke    regression    ui    orders
    [Documentation]    Creates a customer and product via API, then creates an order via UI.
    ${customer}=    Create Customer And Track
    ${product}=     Create Product And Track

    Open Orders List Page
    Click Create Order Button
    Select Customer In Modal    ${customer}[name]
    Add Product To Order    ${product}[name]
    Submit Create Order Form
    ${order_id}=    Verify Order Created
    Track Order    ${order_id}

Create Order — With 5 Products (max)
    [Tags]    regression    ui    orders
    ${customer}=    Create Customer And Track
    ${products}=    Bulk Create Products    count=5

    Open Orders List Page
    Click Create Order Button
    Select Customer In Modal    ${customer}[name]
    FOR    ${product}    IN    @{products}
        Add Product To Order    ${product}[name]
    END
    Submit Create Order Form
    ${order_id}=    Verify Order Created
    Track Order    ${order_id}

*** Keywords ***
Setup UI Suite
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
    Setup UI Browser Context
```

### Step 16.2 — Create remaining UI order test files

Mirror the pytest project's UI test scope:

- `test_order_details.robot` — verify order details page
- `test_order_delivery.robot` — add/edit delivery via UI
- `test_comments.robot` — add, view, delete comments
- `test_assign_manager.robot` — assign/unassign manager
- `test_order_status.robot` — status transitions via UI buttons
- `test_export_orders.robot` — CSV export + file content verification
- `test_order_navigation.robot` — breadcrumbs, back navigation

### Step 16.3 — Run and verify UI tests

```bash
# First generate auth state
robot --include setup tests/ui/auth_setup.robot

# Run UI tests
robot --include ui --include regression -d results tests/ui/orders/
```

---

## Phase 17 — Integration Tests (Mock-based)

**Goal:** Integration test suite that uses network mocking to test UI without a real backend.

### Step 17.1 — Create `tests/ui/integration/test_orders_list_mock.robot`

```robot
*** Settings ***
Documentation    Integration tests — Orders List page with mocked API
Metadata         Suite       UI
Metadata         Sub-Suite   Integration

Library    Browser
Library    libraries/mock/mock_library.py        WITH NAME    Mock

Resource   resources/ui/ui_suite_setup.resource
Resource   resources/ui/pages/orders/orders_list_page.resource

Suite Setup     Setup UI Browser Context
Suite Teardown  Teardown UI Browser Context
Test Setup      Clear All Mocks

*** Test Cases ***
Orders List — Shows mocked orders
    [Tags]    integration    ui    orders
    ${mock_orders}=    Create List
    ...    ${{{"_id": "507f1f77bcf86cd799439011", "status": "Draft", "customer": {"name": "Mock Customer"}, "products": [], "total_price": 0}}}
    Mock.Mock Get All Orders    ${mock_orders}
    Open Orders List Page
    Element Should Be Visible    xpath=//td[contains(text(),'Mock Customer')]

Orders List — Shows empty state when no orders
    [Tags]    integration    ui    orders
    Mock.Mock Get All Orders    ${EMPTY LIST}
    Open Orders List Page
    Element Should Be Visible    css=[data-cy="empty-orders-state"]
```

### Step 17.2 — Create remaining integration test files

- `test_create_order_mock.robot` — create order with mocked customer/product lists
- `test_update_customer_mock.robot` — update customer via UI with mocked order association

---

## Phase 18 — Reporting & Notifications

**Goal:** Allure reports generated; Telegram notification sent in CI.

### Step 18.1 — Configure Allure listener

Add to `robot.toml` for CI (or use CLI flag):

```toml
[ci]
listener = "allure_robotframework"
```

Add to CI run command:

```bash
robot --listener allure_robotframework -d results tests/
```

### Step 18.2 — Add environment properties for Allure

Create `scripts/write_allure_env.py`:

```python
#!/usr/bin/env python3
"""Write environment.properties to allure-results for Allure report."""
import os
from pathlib import Path

results_dir = Path("allure-results")
results_dir.mkdir(exist_ok=True)

env = os.getenv("TEST_ENV", "local")
ui_url = os.getenv("SALES_PORTAL_URL", "http://localhost:8585")
api_url = os.getenv("SALES_PORTAL_API_URL", "http://localhost:8686")

(results_dir / "environment.properties").write_text(
    f"Environment={env}\n"
    f"UI_URL={ui_url}\n"
    f"API_URL={api_url}\n"
    f"Framework=Robot Framework\n"
    f"Browser=Playwright (Browser Library)\n"
)
```

### Step 18.3 — Add screenshot on test failure

In `resources/ui/ui_suite_setup.resource`, add to `Test Teardown`:

```robot
Test Teardown    Run Keywords
...    Capture Page Screenshot    SEPARATOR=AND
...    Full Delete Entities    ${ADMIN_TOKEN}
```

Or as a conditional keyword:

```robot
*** Keywords ***
Take Screenshot On Failure
    Run Keyword If Test Failed    Capture Page Screenshot
    ...    filename=${TEST NAME}-failure.png
```

### Step 18.4 — Implement Telegram notification

```python
# scripts/notify_telegram.py
#!/usr/bin/env python3
"""Send test results notification to Telegram channel."""
import asyncio, os, sys
from telegram import Bot

async def send_notification(message: str) -> None:
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    await Bot(token=token).send_message(chat_id=chat_id, text=message, parse_mode="HTML")

if __name__ == "__main__":
    status = sys.argv[1] if len(sys.argv) > 1 else "unknown"
    report_url = sys.argv[2] if len(sys.argv) > 2 else ""
    msg = (
        f"🤖 <b>Robot Framework Tests</b>\n"
        f"Status: {'✅ Passed' if status == 'passed' else '❌ Failed'}\n"
        f"Report: {report_url}"
    )
    asyncio.run(send_notification(msg))
```

### Step 18.5 — Create `Makefile` targets

```makefile
.PHONY: install test-api test-ui test-smoke test-all lint report setup-auth

install:
    pip install -e ".[dev]"
    rfbrowser init chromium

test-api:
    robot --include api --include regression -d results tests/api/

test-ui:
    robot --include setup tests/ui/auth_setup.robot
    robot --include ui --include regression --exclude setup -d results tests/ui/

test-smoke:
    robot --include smoke -d results tests/

test-all:
    robot --include setup tests/ui/auth_setup.robot
    robot --include regression --exclude setup -d results tests/

lint:
    ruff check libraries/ variables/ data/
    mypy libraries/ variables/ data/
    robocop resources/ tests/

report:
    allure generate allure-results -o allure-report --clean
    allure open allure-report

setup-auth:
    robot --include setup -d results tests/ui/auth_setup.robot
```

---

## Phase 19 — CI/CD Pipelines

**Goal:** GitHub Actions workflows for build checks and full test runs with Allure deploy.

### Step 19.1 — Create `.github/workflows/build.yml`

```yaml
name: Build Check

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -e ".[dev]"
      - run: rfbrowser init chromium
      - run: ruff check libraries/ variables/ data/
      - run: mypy libraries/ variables/ data/
      - run: robocop resources/ tests/
```

### Step 19.2 — Create `.github/workflows/tests.yml`

```yaml
name: Robot Framework Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.49.0-noble

    steps:
      - uses: actions/checkout@v4

      - name: Install Java (for Allure CLI)
        run: apt-get update && apt-get install -y openjdk-17-jdk-headless

      - name: Install Python deps
        run: pip install -e .

      - name: Initialize Browser Library
        run: rfbrowser init chromium

      - name: Start Sales Portal
        run: |
          cd sales-portal
          docker-compose up --build -d
          # Wait for app to be ready
          sleep 15

      - name: Generate Auth State
        run: robot --include setup -d results tests/ui/auth_setup.robot

      - name: Run API Tests
        run: |
          robot --include api --include regression \
                --listener allure_robotframework \
                --outputdir results/api \
                tests/api/

      - name: Run UI Tests
        run: |
          robot --include ui --include regression --exclude setup \
                --listener allure_robotframework \
                --outputdir results/ui \
                tests/ui/

      - name: Write Allure Environment
        run: python scripts/write_allure_env.py

      - name: Generate Allure Report
        run: allure generate allure-results -o allure-report --clean
        if: always()

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        if: always()
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: allure-report

      - name: Send Telegram Notification
        if: always()
        env:
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
        run: |
          STATUS="${{ job.status }}"
          REPORT_URL="https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/"
          python scripts/notify_telegram.py "${STATUS}" "${REPORT_URL}"
```

### Step 19.3 — Configure repository secrets

In GitHub repository settings → Secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

---

## Phase 20 — Final Polish & Documentation

**Goal:** Everything lint-clean, documented, and ready for team use.

### Step 20.1 — Run full lint suite

```bash
# Python files
ruff check libraries/ variables/ data/ scripts/
mypy libraries/ variables/ data/

# RF files
robocop resources/ tests/
robotidy --check resources/ tests/
```

Fix all reported issues. All linters must pass with zero errors.

### Step 20.2 — Run full test suite locally

```bash
# Start the application
cd sales-portal && docker-compose up --build -d && cd ..

# Run all tests
make test-all

# Generate and open Allure report
make report
```

### Step 20.3 — Update `README.md`

Document:

1. **Project overview** — what this framework tests and how it relates to the TS/Python counterparts
2. **Prerequisites** — Python 3.12+, Docker/Docker Compose, Java 17 (for Allure CLI)
3. **Quick start** — `git clone` → `pip install -e .` → `rfbrowser init` → `make test-all`
4. **Running specific suites** — `robot --include smoke tests/` etc.
5. **Environment setup** — copy `.env.dist` to `.env`, fill values
6. **Reporting** — `make report` to view Allure report locally
7. **Project structure** — brief layer overview with directory tree
8. **Adding new tests** — which layer to edit (library vs resource vs test suite)
9. **CI/CD** — link to GitHub Actions + Allure report URL

### Step 20.4 — Final verification checklist

- [ ] `make lint` passes — zero ruff, mypy, robocop errors
- [ ] `make test-api` — all API tests pass
- [ ] `make test-ui` — all UI tests pass (with running app)
- [ ] `make test-smoke` — smoke tests pass
- [ ] Cleanup verified — no orphaned entities after test run (check DB via Mongo Express)
- [ ] Allure report generated with correct steps, attachments, and environment info
- [ ] CI workflow triggers and passes on push to `main`
- [ ] Telegram notification sent with report link
- [ ] `README.md` is up to date

---

## Appendix A — Mapping to pytest Project

This table maps every major component of the existing Python pytest framework to its Robot Framework equivalent in this plan:

| pytest Component                                  | Robot Framework Equivalent                                          | Phase |
| ------------------------------------------------- | ------------------------------------------------------------------- | ----- |
| `config/env.py`                                   | `variables/env.py`                                                  | 2     |
| `config/api_config.py`                            | `variables/api_config.py`                                           | 2     |
| `data/sales_portal/constants.py`                  | `variables/constants.py`                                            | 2     |
| `data/enums/` (StrEnum classes)                   | `data/enums/` (same Python StrEnum classes)                         | 3     |
| `data/models/` (Pydantic)                         | `data/models/` (same Pydantic models)                               | 3     |
| `data/schemas/` (JSON Schema dicts)               | `data/schemas/` (same Python dicts)                                 | 3     |
| `data/sales_portal/*/generate_*.py`               | `data/generators/generate_*.py` (same `faker` generators)           | 3     |
| DDT `*_POSITIVE_CASES` / `*_NEGATIVE_CASES` lists | `data/ddt/*.csv` files (DataDriver)                                 | 3     |
| `utils/validation/validate_response.py`           | `libraries/utils/validation_library.py`                             | 4     |
| `utils/date_utils.py`                             | `libraries/utils/date_utils_library.py`                             | 4     |
| `utils/notifications/telegram_service.py`         | `libraries/utils/notifications/telegram_library.py`                 | 4     |
| `api/api_clients/playwright_api_client.py`        | `libraries/api/api_client.py` (requests wrapper)                    | 5     |
| `api/api/login_api.py`                            | `libraries/api/endpoints/login_api_library.py`                      | 6     |
| `api/api/products_api.py`                         | `libraries/api/endpoints/products_api_library.py`                   | 6     |
| `api/api/customers_api.py`                        | `libraries/api/endpoints/customers_api_library.py`                  | 6     |
| `api/api/orders_api.py`                           | `libraries/api/endpoints/orders_api_library.py`                     | 6     |
| `api/api/notifications_api.py`                    | `libraries/api/endpoints/notifications_api_library.py`              | 6     |
| `api/service/login_service.py`                    | `resources/api/service/login_service.resource`                      | 7     |
| `api/service/products_service.py`                 | `resources/api/service/products_service.resource`                   | 7     |
| `api/service/customers_service.py`                | `resources/api/service/customers_service.resource`                  | 7     |
| `api/service/orders_service.py`                   | `resources/api/service/orders_service.resource`                     | 7     |
| `api/service/stores/entities_store.py`            | `libraries/stores/entity_store_library.py`                          | 10    |
| `api/facades/orders_facade_service.py`            | `resources/api/facades/orders_facade.resource`                      | 7     |
| `tests/conftest.py` (session fixtures)            | `Suite Setup` keywords in each test suite                           | 8     |
| `tests/conftest.py` `cleanup` fixture             | `Test Teardown    Full Delete Entities` + `EntityStoreLibrary`      | 10    |
| `ui/pages/base_page.py`                           | `resources/ui/pages/base_page.resource`                             | 11    |
| `ui/pages/sales_portal_page.py`                   | `resources/ui/pages/sales_portal_page.resource`                     | 11    |
| `ui/pages/base_modal.py`                          | `resources/ui/pages/base_modal.resource`                            | 11    |
| `ui/pages/login/`                                 | `resources/ui/pages/login_page.resource`                            | 11    |
| `ui/pages/products/`                              | `resources/ui/pages/products/`                                      | 12    |
| `ui/pages/customers/`                             | `resources/ui/pages/customers/`                                     | 12    |
| `ui/pages/orders/`                                | `resources/ui/pages/orders/`                                        | 12    |
| `ui/service/*_ui_service.py`                      | `resources/ui/service/*.resource`                                   | 13    |
| `mock/mock.py`                                    | `libraries/mock/mock_library.py`                                    | 14    |
| `tests/ui/conftest.py` (storage_state_path)       | `tests/ui/auth_setup.robot`                                         | 15    |
| `tests/ui/conftest.py` (browser_context_args)     | `resources/ui/ui_suite_setup.resource`                              | 15    |
| `tests/api/**`                                    | `tests/api/**/*.robot`                                              | 8–9   |
| `tests/ui/orders/**`                              | `tests/ui/orders/**/*.robot`                                        | 16    |
| `tests/ui/integration/**`                         | `tests/ui/integration/**/*.robot`                                   | 17    |
| `utils/report/` (Allure)                          | `allure-robotframework` listener + `@allure.step()` in keyword libs | 18    |
| `scripts/notify_telegram.py`                      | `scripts/notify_telegram.py` (identical)                            | 18    |
| `Makefile`                                        | `Makefile` (RF equivalents of make targets)                         | 18    |
| `.github/workflows/`                              | `.github/workflows/` (RF-adapted CI steps)                          | 19    |

---

## Appendix B — Estimated Effort Per Phase

| Phase     | Description                         | Estimated effort |
| --------- | ----------------------------------- | ---------------- |
| 1         | Project skeleton & tooling          | 0.5 day          |
| 2         | Configuration & environment         | 0.5 day          |
| 3         | Data layer                          | 1 day            |
| 4         | Utility keyword libraries           | 1 day            |
| 5         | API client library                  | 0.5 day          |
| 6         | API endpoint keyword libraries      | 2 days           |
| 7         | API service & facade resources      | 1 day            |
| 8         | First API tests (Login + Products)  | 1 day            |
| 9         | Remaining API tests                 | 3 days           |
| 10        | Entity store library & cleanup      | 0.5 day          |
| 11        | UI base layer                       | 1 day            |
| 12        | UI domain page resources            | 3 days           |
| 13        | UI service resources                | 2 days           |
| 14        | Mock / network interception library | 1 day            |
| 15        | Auth setup & UI infrastructure      | 0.5 day          |
| 16        | UI tests                            | 4 days           |
| 17        | Integration tests (mock-based)      | 1 day            |
| 18        | Reporting & notifications           | 1 day            |
| 19        | CI/CD pipelines                     | 1 day            |
| 20        | Final polish & documentation        | 0.5 day          |
| **Total** |                                     | **~26 days**     |
