# Technology Stack & Architecture — Robot Framework Implementation

> **Project:** Sales Portal — End-to-end test automation framework (Robot Framework re-implementation)
> **Original (TypeScript):** see [`STACK.md`](./STACK.md)
> **Original (Python/pytest):** see [`STACK_PYTHON.md`](./STACK_PYTHON.md)
> **Dev environment:** [`sales-portal/`](./sales-portal/) (Express + MongoDB backend, vanilla JS frontend, Docker Compose)
> **Goal:** Reproduce every capability of the TypeScript and Python frameworks using **Robot Framework + Playwright + Python**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Technologies](#2-core-technologies)
3. [Libraries & Dependencies](#3-libraries--dependencies)
4. [Project Architecture](#4-project-architecture)
5. [Layer-by-Layer Breakdown](#5-layer-by-layer-breakdown)
6. [Test Strategy & Patterns](#6-test-strategy--patterns)
7. [Configuration & Environment](#7-configuration--environment)
8. [Linting, Formatting & Git Hooks](#8-linting-formatting--git-hooks)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Reporting & Notifications](#10-reporting--notifications)
11. [Directory Reference](#11-directory-reference)
12. [Framework Comparison Map](#12-framework-comparison-map)

---

## 1. Overview

This project is a **Robot Framework + Browser Library (Playwright)** test-automation framework providing both **API** and **UI** test coverage for the Sales Portal product. It preserves the same multi-layered, service-oriented architecture as the TypeScript and Python projects while leveraging Robot Framework's natural-language keyword syntax, built-in resource/library system, and `robot:` tag approach.

The framework is structured around a clear separation of concerns:

- **Python keyword libraries** for low-level API/UI operations (mirrors the `api_clients/`, `api/`, and `pages/` layers from the pytest project)
- **Resource files** (`.resource`) for higher-level reusable keyword compositions (mirrors `service/` and `facades/`)
- **Test suites** (`.robot`) for business scenarios with data-driven tables
- **Variable files** for environment/data configuration (mirrors `config/env.py` and `data/`)

### Application Under Test

The Sales Portal is a full-stack web application located in the `sales-portal/` directory. See [`STACK_PYTHON.md#1-overview`](./STACK_PYTHON.md) for full details.

| URL                              | Description               |
| -------------------------------- | ------------------------- |
| `http://localhost:8585`          | Frontend UI               |
| `http://localhost:8686`          | Backend API               |
| `http://localhost:8686/api/docs` | Swagger API documentation |
| `http://localhost:8081`          | Mongo Express DB admin    |

---

## 2. Core Technologies

| Technology                    | Version (recommended)    | Purpose                                                               | pytest Equivalent                  | TS Equivalent          |
| ----------------------------- | ------------------------ | --------------------------------------------------------------------- | ---------------------------------- | ---------------------- |
| **Python**                    | 3.12+                    | Keyword library implementation language; strict type hints via `mypy` | Same                               | TypeScript 5.9         |
| **Robot Framework**           | 7.x                      | Test runner, keyword engine, DDT (data-driven), tagging, listener API | pytest 8.x                         | Playwright Test runner |
| **robotframework-browser**    | 18.x (Playwright 1.49+)  | Browser automation via Playwright under the hood (RF Browser Library) | `pytest-playwright` + `playwright` | `@playwright/test`     |
| **robotframework-requests**   | 0.9+ (`RequestsLibrary`) | HTTP calls for API tests — wraps `requests`                           | Playwright `APIRequestContext`     | `APIRequestContext`    |
| **robotframework-datadriver** | 1.11+                    | CSV/Excel/JSON data-driven test execution                             | `@pytest.mark.parametrize`         | `for...of` case tables |
| **uv** or **pip**             | latest                   | Dependency management                                                 | Same                               | `npm ci`               |

### Why Robot Framework Browser Library (not SeleniumLibrary)?

| Feature                         | Browser Library (Playwright)            | SeleniumLibrary                  |
| ------------------------------- | --------------------------------------- | -------------------------------- |
| Browser engine                  | Chromium / Firefox / WebKit             | ChromeDriver / GeckoDriver / ... |
| Network interception (mocking)  | ✅ Native (`Mock Request`)              | ❌ Not supported natively        |
| Multiple browser support        | ✅ Natively parallel                    | ✅ With extra config             |
| Tracing / screenshots / videos  | ✅ Built-in                             | ⚠️ Screenshots only              |
| Auto-wait for elements          | ✅ Built-in                             | ⚠️ Requires explicit waits       |
| Storage state (auth injection)  | ✅ `Save Storage State` / `New Context` | ❌ Manual cookie handling        |
| Active development / Playwright | ✅ Actively maintained                  | ✅ Actively maintained           |

---

## 3. Libraries & Dependencies

### 3.1 Core Test Dependencies

| Library                              | Version | Purpose                                                     | pytest Equivalent                  |
| ------------------------------------ | ------- | ----------------------------------------------------------- | ---------------------------------- |
| **robotframework**                   | ^7.0    | Core RF engine, runner, keyword/resource/variable system    | `pytest`                           |
| **robotframework-browser**           | ^18.0   | Browser Library — Playwright-backed UI automation keywords  | `playwright` + `pytest-playwright` |
| **robotframework-requests**          | ^0.9    | `RequestsLibrary` — HTTP calls for API tests via `requests` | Playwright `APIRequestContext`     |
| **robotframework-datadriver**        | ^1.11   | Data-driven tests from CSV/JSON/Excel                       | `@pytest.mark.parametrize`         |
| **robotframework-jsonlibrary**       | ^0.5    | JSON parsing, JSONPath queries, schema helpers              | `jsonschema` / Pydantic            |
| **robotframework-excellib** _(opt.)_ | ^1.5    | Excel data source for DDT                                   | _(optional)_                       |

### 3.2 Python Support Libraries (used inside keyword libraries)

| Library                   | Version | Purpose                                                 | pytest Equivalent              |
| ------------------------- | ------- | ------------------------------------------------------- | ------------------------------ |
| **requests**              | ^2.32   | HTTP client used inside `RequestsLibrary` + custom libs | Playwright `APIRequestContext` |
| **pydantic**              | ^2.10   | Typed response model parsing in keyword libraries       | Same                           |
| **faker**                 | ^33.0   | Randomised test data generation in Python keyword libs  | Same                           |
| **python-dotenv**         | ^1.1    | `.env` loading in variable files and keyword libraries  | Same                           |
| **jsonschema**            | ^4.23   | JSON Schema validation in custom keyword libraries      | Same                           |
| **pymongo**               | ^4.10   | `bson.ObjectId` for mock data construction              | Same                           |
| **python-telegram-bot**   | ^21.x   | CI Telegram notifications                               | Same                           |
| **allure-robotframework** | ^2.13   | Allure reporting integration for Robot Framework        | `allure-pytest`                |

### 3.3 Linting, Formatting & Type Checking

| Tool           | Version | Purpose                                                        | pytest Equivalent |
| -------------- | ------- | -------------------------------------------------------------- | ----------------- |
| **ruff**       | ^0.8    | Linter + formatter for Python keyword library code             | Same              |
| **mypy**       | ^1.14   | Static type checking on Python keyword libraries               | Same              |
| **robocop**    | ^5.0    | Robot Framework static analysis (`.robot` / `.resource` files) | ruff (for `.py`)  |
| **robotidy**   | ^4.15   | Robot Framework code formatter (`.robot` / `.resource` files)  | ruff (formatter)  |
| **pre-commit** | ^4.0    | Git hook manager                                               | Same              |

### 3.4 Reporting

| Tool                          | Purpose                                                      | pytest Equivalent |
| ----------------------------- | ------------------------------------------------------------ | ----------------- |
| **Robot Framework built-in**  | `log.html` + `report.html` + `output.xml` (native RF output) | pytest-html       |
| **allure-robotframework**     | Rich Allure report with step trees, attachments, env info    | `allure-pytest`   |
| **allure-commandline** (Java) | Allure CLI for report generation                             | Same              |

---

## 4. Project Architecture

The framework follows the same **multi-layer service-oriented architecture** as the Python project, expressed through Robot Framework's resource/library system:

```
┌────────────────────────────────────────────────────────────────┐
│                        Test Suites Layer                       │
│   tests/api/**/*.robot    tests/ui/**/*.robot                  │
│   tests/ui/integration/**/*.robot                              │
└────────────┬──────────────────────────┬───────────────────────┘
             │                          │
     ┌───────▼────────┐        ┌────────▼───────┐
     │ API Resources  │        │  UI Resources  │
     │ (service/)     │        │  (service/)    │
     │ *.resource     │        │  *.resource    │
     └───────┬────────┘        └────────┬───────┘
             │                          │
     ┌───────▼────────┐        ┌────────▼───────┐
     │  API Keyword   │        │ Page Resources │
     │  Libraries     │        │  (pages/)      │
     │  (Python libs) │        │  *.resource    │
     └───────┬────────┘        └────────┬───────┘
             │                          │
     ┌───────▼────────┐        ┌────────▼───────┐
     │  HTTP Client   │        │ Browser Library│
     │  (requests)    │        │ (Playwright)   │
     └────────────────┘        └────────────────┘
             │                          │
     ┌───────▼──────────────────────────▼───────┐
     │             Variables Layer               │
     │  variables/env.py  variables/constants.py │
     │  data/generators/  data/ddt/              │
     └────────────────────────────────────────────┘
```

### Key Design Principles

| Principle                    | pytest Implementation                | Robot Framework Implementation                                     |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| **Dependency Injection**     | `@pytest.fixture` conftest.py        | Suite/Test `Setup` / `Teardown` keywords + `Variables` section     |
| **Service / Facade Pattern** | Python service classes               | `.resource` files with composed keywords (Service Resource)        |
| **Page Object Model**        | Python Page Object classes           | Page `.resource` files + Python Browser Library keyword extensions |
| **Data-Driven Testing**      | `@pytest.mark.parametrize`           | `Test Template` + `DataDriver` library (CSV/JSON) or inline tables |
| **Schema Validation**        | `jsonschema` + `validate_response()` | `JSONLibrary` + Python keyword library `ValidateResponse`          |
| **Type Safety**              | `mypy` strict on `.py` files         | `mypy` on keyword library `.py` files; `robocop` on `.robot` files |
| **Step Reporting**           | `@allure.step()`                     | `allure-robotframework` listener + keyword names as step titles    |
| **Cleanup / Teardown**       | `yield` fixture + `EntitiesStore`    | `Test Teardown` keyword + `EntityStore` Python library             |

---

## 5. Layer-by-Layer Breakdown

### 5.1 Configuration Layer (`variables/`)

Robot Framework uses **variable files** (`.py` or `.yaml`) instead of `conftest.py` for environment configuration.

| File                      | Role                                                                                                    | pytest Equivalent                |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `variables/env.py`        | Loads `.env` / `.env.dev`, exports `SALES_PORTAL_URL`, `SALES_PORTAL_API_URL`, credentials, manager IDs | `config/env.py`                  |
| `variables/api_config.py` | Module-level endpoint URL constants and builder functions                                               | `config/api_config.py`           |
| `variables/constants.py`  | Timeouts, retry counts, viewport, other constants                                                       | `data/sales_portal/constants.py` |

Variable files are loaded globally via `robot.toml` or per-suite via `Variables` section.

### 5.2 API Client Layer (`libraries/api/`)

Python keyword libraries that wrap HTTP communication, analogous to `api_clients/` in the pytest project.

| Module                        | Role                                                                                                               | pytest Equivalent     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `libraries/api/api_client.py` | `ApiClientLibrary` — wraps `requests.Session`; provides `Send Request`, attaches req/resp to Allure; masks secrets | `PlaywrightApiClient` |
| `libraries/api/response.py`   | `ApiResponse` dataclass — normalises response body, status, headers                                                | `Response` model      |

**Note:** `RequestsLibrary` (from `robotframework-requests`) handles most HTTP primitives as RF keywords; `ApiClientLibrary` wraps it to add Allure attachment and secret masking on top.

### 5.3 API Endpoint Keyword Libraries (`libraries/api/endpoints/`)

One Python class (RF keyword library) per domain, each providing `@keyword`-decorated methods:

| Module                         | Keywords provided                                                                                                                                                                                                           | pytest Equivalent  |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `login_api_library.py`         | `Login User`, `Logout User`                                                                                                                                                                                                 | `LoginApi`         |
| `products_api_library.py`      | `Create Product`, `Get Product By Id`, `Get All Products`, `Update Product`, `Delete Product`                                                                                                                               | `ProductsApi`      |
| `customers_api_library.py`     | `Create Customer`, `Get Customer By Id`, `Get All Customers`, `Update Customer`, `Delete Customer`                                                                                                                          | `CustomersApi`     |
| `orders_api_library.py`        | `Create Order`, `Get Order By Id`, `Update Order`, `Delete Order`, `Add Order Delivery`, `Update Order Status`, `Receive Order Products`, `Add Order Comment`, `Delete Order Comment`, `Assign Manager`, `Unassign Manager` | `OrdersApi`        |
| `notifications_api_library.py` | `Get Notifications`, `Mark Notification Read`, `Mark All Notifications Read`                                                                                                                                                | `NotificationsApi` |

Every `@keyword` uses `allure.step()` for automatic Allure step reporting.

### 5.4 API Service Resources (`resources/api/service/`)

High-level `.resource` files that compose endpoint keywords into business flows — analogous to `api/service/` in the pytest project.

| Resource File                | Keywords provided                                                              | pytest Equivalent     |
| ---------------------------- | ------------------------------------------------------------------------------ | --------------------- |
| `login_service.resource`     | `Login As Admin`, `Get Admin Token`                                            | `LoginService`        |
| `products_service.resource`  | `Create Product And Track`, `Delete Product By Id`, `Bulk Create Products`     | `ProductsApiService`  |
| `customers_service.resource` | `Create Customer And Track`, `Delete Customer By Id`                           | `CustomersApiService` |
| `orders_service.resource`    | `Create Order And Track`, `Create Order With Delivery`, `Full Delete Entities` | `OrdersApiService`    |

### 5.5 API Facade Resources (`resources/api/facades/`)

Cross-domain `.resource` files for multi-step, end-to-end orchestration — analogous to `api/facades/` in the pytest project.

| Resource File            | Keywords provided                                                          | pytest Equivalent     |
| ------------------------ | -------------------------------------------------------------------------- | --------------------- |
| `orders_facade.resource` | `Create Full Order Lifecycle`, `Process Order To Received`, `Cancel Order` | `OrdersFacadeService` |

### 5.6 Entity Store Library (`libraries/stores/entity_store_library.py`)

Python keyword library that tracks created entity IDs for deterministic teardown — analogous to `EntitiesStore`.

| Keyword                | Description                     |
| ---------------------- | ------------------------------- |
| `Track Product`        | Adds product ID to cleanup set  |
| `Track Customer`       | Adds customer ID to cleanup set |
| `Track Order`          | Adds order ID to cleanup set    |
| `Get Tracked Products` | Returns the product ID set      |
| `Get Tracked Orders`   | Returns the order ID set        |
| `Clear Entity Store`   | Resets all tracked ID sets      |

Used in `Test Teardown` via `orders_service.resource` `Full Delete Entities`.

### 5.7 UI Page Resources (`resources/ui/pages/`)

`.resource` files for page-level UI interactions — analogous to `ui/pages/` Page Objects in the pytest project.

Inheritance mirrors the pytest chain but expressed via resource import and keyword composition:

```
base_page.resource          (common: wait for spinner, handle cookies, intercept)
  └─ sales_portal_page.resource   (open, wait for opened, toast assertions)
       ├─ base_modal.resource     (wait for closed, confirm, cancel)
       ├─ login_page.resource     (fill username, fill password, click login)
       ├─ home_page.resource      (verify home page elements)
       ├─ products/
       │   ├─ products_list_page.resource
       │   ├─ add_new_product_page.resource
       │   ├─ edit_product_page.resource
       │   └─ product_details_modal.resource
       ├─ customers/
       │   ├─ customers_list_page.resource
       │   ├─ add_new_customer_page.resource
       │   └─ customer_details_modal.resource
       └─ orders/
           ├─ orders_list_page.resource
           ├─ order_details_page.resource
           ├─ create_order_modal.resource
           └─ edit_products_modal.resource
```

**Python Browser Library keyword extensions** (`libraries/ui/`) are used for complex interactions that need Playwright's Python API directly (e.g., file downloads, network interception state checks, storage state management).

### 5.8 UI Service Resources (`resources/ui/service/`)

High-level `.resource` files composing page resources into multi-step user flows — analogous to `ui/service/` in the pytest project.

| Resource File                          | Keywords provided                                           | pytest Equivalent         |
| -------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| `login_ui_service.resource`            | `Login As Admin Via UI`                                     | `LoginUIService`          |
| `add_new_product_ui_service.resource`  | `Add New Product`, `Fill Product Form`                      | `AddNewProductUIService`  |
| `edit_product_ui_service.resource`     | `Edit Product`, `Verify Product Details`                    | `EditProductUIService`    |
| `products_list_ui_service.resource`    | `Filter Products`, `Sort Products`, `Export Products`       | `ProductsListUIService`   |
| `add_new_customer_ui_service.resource` | `Add New Customer`, `Fill Customer Form`                    | `AddNewCustomerUIService` |
| `order_details_ui_service.resource`    | `Fill Order Delivery`, `Change Order Status`, `Add Comment` | `OrderDetailsUIService`   |
| `assign_manager_ui_service.resource`   | `Assign Manager To Order`, `Unassign Manager`               | `AssignManagerUIService`  |
| `comments_ui_service.resource`         | `Add Comment`, `Delete Comment`, `Verify Comment`           | `CommentsUIService`       |

### 5.9 Mock / Network Interception (`libraries/mock/`)

Python keyword library wrapping Browser Library's `Mock Request` / `Mock Response` for network interception — analogous to `mock/mock.py` in the pytest project.

| Module            | Keywords provided                                                                                           | pytest Equivalent |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ----------------- |
| `mock_library.py` | `Mock Get All Products`, `Mock Get All Orders`, `Mock Get Metrics`, `Mock Order Details`, `Clear All Mocks` | `Mock` class      |

Used in integration test suites that test UI without a real backend.

### 5.10 Validation Keyword Library (`libraries/utils/validation_library.py`)

Python keyword library for response validation — analogous to `utils/validation/validate_response.py`.

| Keyword                | Description                                                         |
| ---------------------- | ------------------------------------------------------------------- |
| `Validate Response`    | Asserts status code, `IsSuccess`, `ErrorMessage`; runs schema check |
| `Validate Json Schema` | Validates response body dict against a JSON Schema dict             |

Uses `jsonschema.validate()` and `pytest_check`-equivalent soft assertions via custom logic.

---

## 6. Test Strategy & Patterns

### 6.1 Test Organisation

```
tests/
├── api/
│   ├── products/
│   │   ├── test_create_product.robot
│   │   ├── test_get_product.robot
│   │   ├── test_update_product.robot
│   │   └── test_delete_product.robot
│   ├── customers/
│   │   ├── test_create_customer.robot
│   │   ├── test_get_customer.robot
│   │   └── test_delete_customer.robot
│   └── orders/
│       ├── test_create_order.robot
│       ├── test_update_order.robot
│       ├── test_order_delivery.robot
│       ├── test_order_status.robot
│       ├── test_order_receive.robot
│       ├── test_order_comments.robot
│       └── test_assign_manager.robot
└── ui/
    ├── auth_setup.robot         (generates storage state once per session)
    ├── orders/
    │   ├── test_create_order.robot
    │   ├── test_order_details.robot
    │   ├── test_order_delivery.robot
    │   ├── test_comments.robot
    │   ├── test_assign_manager.robot
    │   ├── test_export_orders.robot
    │   └── test_order_status.robot
    └── integration/
        ├── test_orders_list_mock.robot
        ├── test_create_order_mock.robot
        └── test_update_customer_mock.robot
```

### 6.2 Robot Framework Configuration (`robot.toml` / `pyproject.toml`)

```toml
[tool.robot]
testpaths = ["tests"]
variablefiles = ["variables/env.py"]
outputdir = "results"
loglevel = "INFO"
```

**Tags** replace pytest markers. Available tags (defined by convention):

| Tag           | Meaning                         | pytest Equivalent          |
| ------------- | ------------------------------- | -------------------------- |
| `smoke`       | Critical-path tests             | `@pytest.mark.smoke`       |
| `regression`  | Full regression suite           | `@pytest.mark.regression`  |
| `integration` | Mock-based UI integration tests | `@pytest.mark.integration` |
| `api`         | API-only tests                  | `@pytest.mark.api`         |
| `ui`          | UI-only tests                   | `@pytest.mark.ui`          |
| `products`    | Product domain tests            | `@pytest.mark.products`    |
| `customers`   | Customer domain tests           | `@pytest.mark.customers`   |
| `orders`      | Order domain tests              | `@pytest.mark.orders`      |

**Run commands:**

```bash
# All tests
robot tests/

# API only
robot --include api tests/

# UI only
robot --include ui tests/

# Smoke
robot --include smoke tests/

# Regression
robot --include regression tests/

# With Allure
robot --listener allure_robotframework tests/

# Parallel (robotframework-pabot)
pabot --processes 4 --include regression tests/
```

### 6.3 Test Structure: DDT (Data-Driven Testing)

Robot Framework supports two DDT approaches — both are used:

#### Approach A — Inline `Test Template` (for simple cases)

```robot
*** Settings ***
Test Template    Create Product Should Return Status

*** Test Cases ***          name             amount  price   manufacturer  expected_status
Valid product               Samsung Phone    10      999     Samsung       201
Missing name                ${EMPTY}         10      999     Samsung       400
Invalid manufacturer        Phone            10      999     Unknown       400

*** Keywords ***
Create Product Should Return Status
    [Arguments]    ${name}    ${amount}    ${price}    ${manufacturer}    ${expected_status}
    ${token}=      Get Admin Token
    ${data}=       Create Product Payload    ${name}    ${amount}    ${price}    ${manufacturer}
    ${response}=   Create Product    ${token}    ${data}
    Validate Response    ${response}    ${expected_status}
```

#### Approach B — External CSV via `DataDriver` (for large / generated datasets)

```robot
*** Settings ***
Library    DataDriver    file=data/ddt/create_product_cases.csv    dialect=excel

Test Template    Create Product Case

*** Test Cases ***
Create Product - ${case_name}

*** Keywords ***
Create Product Case
    [Arguments]    ${case_name}    ${name}    ${amount}    ${price}    ${manufacturer}    ${expected_status}
    ...
```

### 6.4 Authentication & Storage State

```robot
# tests/ui/auth_setup.robot
*** Settings ***
Library    Browser

*** Test Cases ***
Generate Auth Storage State
    [Tags]    setup
    New Browser    chromium    headless=True
    New Context
    New Page    ${SALES_PORTAL_URL}
    # login flow...
    Save Storage State    path=${STORAGE_STATE_PATH}
    Close Browser
```

Storage state is reloaded in UI suites via `Suite Setup`:

```robot
*** Settings ***
Suite Setup    New Context    storageState=${STORAGE_STATE_PATH}    viewport={'width': 1920, 'height': 1080}
```

### 6.5 Cleanup / Teardown Pattern

```robot
*** Settings ***
Test Teardown    Full Delete Entities    ${ADMIN_TOKEN}

*** Test Cases ***
Create Order With Products
    [Tags]    orders    smoke
    ${customer}=    Create Customer And Track
    ${product}=     Create Product And Track
    ${order}=       Create Order And Track    ${customer}[id]    ${product}[id]
    # assertions...
```

The `Full Delete Entities` keyword (from `orders_service.resource`) deletes tracked orders → products → customers in teardown, using `EntityStoreLibrary`.

### 6.6 Allure Reporting Integration

The `allure-robotframework` listener auto-captures every keyword call as an Allure step. Additional metadata is added via:

```robot
*** Settings ***
Metadata    Suite        API
Metadata    Sub-Suite    Products
```

And inline:

```robot
*** Test Cases ***
Create Product — Valid Data
    [Tags]    smoke    regression    products    api
    [Documentation]    POST /api/products with all valid fields returns 201.
```

---

## 7. Configuration & Environment

### 7.1 Environment Variables

Same variables as the pytest project — loaded via `python-dotenv` in `variables/env.py`:

| Variable               | Description                           | Local default (Docker Compose) |
| ---------------------- | ------------------------------------- | ------------------------------ |
| `SALES_PORTAL_URL`     | UI base URL                           | `http://localhost:8585`        |
| `SALES_PORTAL_API_URL` | API base URL                          | `http://localhost:8686`        |
| `USER_NAME`            | Test user email                       | `admin@example.com`            |
| `USER_PASSWORD`        | Test user password                    | `admin123`                     |
| `MANAGER_IDS`          | JSON array of manager UUIDs           |                                |
| `TELEGRAM_BOT_TOKEN`   | (optional) Telegram bot token         |                                |
| `TELEGRAM_CHAT_ID`     | (optional) Telegram chat ID           |                                |
| `TEST_ENV`             | Set to `dev` to load `.env.dev`       |                                |
| `STORAGE_STATE_PATH`   | Path for Browser storage state JSON   | `src/.auth/user.json`          |
| `HEADLESS`             | `True`/`False` for headless execution | `True`                         |
| `BROWSER`              | `chromium`/`firefox`/`webkit`         | `chromium`                     |

### 7.2 Variable Files

```python
# variables/env.py — loaded globally via robot.toml
import os, json
from dotenv import load_dotenv

load_dotenv(".env.dev" if os.getenv("TEST_ENV") == "dev" else ".env")

SALES_PORTAL_URL = os.environ["SALES_PORTAL_URL"]
SALES_PORTAL_API_URL = os.environ["SALES_PORTAL_API_URL"]
USER_NAME = os.environ["USER_NAME"]
USER_PASSWORD = os.environ["USER_PASSWORD"]
MANAGER_IDS: list[str] = json.loads(os.environ["MANAGER_IDS"])
STORAGE_STATE_PATH = os.getenv("STORAGE_STATE_PATH", "src/.auth/user.json")
HEADLESS = os.getenv("HEADLESS", "True").lower() == "true"
BROWSER = os.getenv("BROWSER", "chromium")
```

```python
# variables/api_config.py — API endpoint paths
BASE_URL = SALES_PORTAL_API_URL

LOGIN = f"{BASE_URL}/api/login"
PRODUCTS = f"{BASE_URL}/api/products"
PRODUCTS_ALL = f"{BASE_URL}/api/products/all"
CUSTOMERS = f"{BASE_URL}/api/customers"
ORDERS = f"{BASE_URL}/api/orders"
# ... all endpoints mirroring config/api_config.py from the pytest project
```

### 7.3 Project Configuration (`pyproject.toml`)

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
    "faker>=33.0",
    "pydantic>=2.10",
    "python-dotenv>=1.1",
    "jsonschema>=4.23",
    "pymongo>=4.10",
    "python-telegram-bot>=21.0",
    "robotframework-pabot>=2.18",   # parallel execution
]

[project.optional-dependencies]
dev = [
    "ruff>=0.8",
    "mypy>=1.14",
    "pre-commit>=4.0",
    "robocop>=5.0",
    "robotidy>=4.15",
]

[tool.mypy]
strict = true
python_version = "3.12"
plugins = ["pydantic.mypy"]
ignore_missing_imports = true

[tool.ruff]
line-length = 120
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "W", "I", "UP", "B", "SIM", "RUF"]
```

---

## 8. Linting, Formatting & Git Hooks

### 8.1 Python Keyword Libraries

- **ruff** for linting + formatting (same rules as the pytest project: E, F, W, I, UP, B, SIM, RUF; line-length 120).
- **mypy --strict** for type checking on all `libraries/` and `variables/` Python files.

### 8.2 Robot Framework Files

- **robocop** — static analysis for `.robot` and `.resource` files. Key rules enforced:
  - No too-long lines (max 120 chars)
  - No trailing whitespace
  - Consistent keyword naming (Title Case)
  - No deprecated RF3 syntax
  - Required keyword documentation
- **robotidy** — auto-formatter for `.robot` and `.resource` files (consistent indentation, alignment, ordering).

### 8.3 Git Hooks (`pre-commit`)

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
        args: [--fix]
        files: "^(libraries|variables)/"
      - id: ruff-format
        files: "^(libraries|variables)/"

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.14.0
    hooks:
      - id: mypy
        files: "^(libraries|variables)/"
        additional_dependencies: [pydantic>=2.10]

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

---

## 9. CI/CD Pipeline

### 9.1 Build Check (`build.yml`)

- Triggered on **pull requests** to `main`.
- Steps: checkout → Python 3.12 → `pip install -e ".[dev]"` → `playwright install chromium` → `rfbrowser init` → `ruff check` → `mypy` → `robocop`.

### 9.2 Test Run + Report (`tests.yml`)

- Triggered on **push/PR to `main`** + manual `workflow_dispatch`.
- Uses Docker image with Python + Playwright pre-installed.
- Steps:
  1. Checkout
  2. Install OpenJDK 17 (for Allure CLI)
  3. `pip install -e .`
  4. `rfbrowser init` (downloads Playwright browsers for Browser Library)
  5. Run API regression: `robot --include api --include regression --listener allure_robotframework tests/api/`
  6. Run UI regression: `robot --include ui --include regression --listener allure_robotframework tests/ui/`
  7. Generate Allure report: `allure generate allure-results -o allure-report --clean`
  8. Deploy to **GitHub Pages**
  9. Send **Telegram notification**

### 9.3 Parallel Execution

Use `pabot` (Playwright-aware Robot Framework paralleliser):

```bash
pabot --processes 4 --include regression tests/
```

---

## 10. Reporting & Notifications

### 10.1 Robot Framework Native Reports

| Report        | File                  | Description                                       |
| ------------- | --------------------- | ------------------------------------------------- |
| `log.html`    | `results/log.html`    | Full keyword-level execution log with timing      |
| `report.html` | `results/report.html` | High-level test summary with pass/fail statistics |
| `output.xml`  | `results/output.xml`  | Machine-readable RF output (used by Allure, CI)   |

### 10.2 Allure Integration

- `allure-robotframework` listener attached at runtime via `--listener allure_robotframework`.
- Every keyword call becomes an Allure step with timing.
- Test metadata (`[Tags]`, `[Documentation]`, `Metadata`) maps to Allure labels.
- API request/response JSON attached to steps via `allure.attach()` inside Python keyword libraries.
- Screenshots auto-attached on test failure via `Test Teardown    Capture Page Screenshot`.

### 10.3 Screenshots & Video

| Artifact   | When captured                                     | Mechanism                             |
| ---------- | ------------------------------------------------- | ------------------------------------- |
| Screenshot | On test failure                                   | `Capture Page Screenshot` in teardown |
| Video      | Configurable via `New Context    recordVideo=...` | Browser Library context option        |
| Trace      | Configurable per context                          | `New Context    tracing=True`         |

### 10.4 Telegram Notifications

Same `TelegramService` Python class as the pytest project — invoked from `scripts/notify_telegram.py` after the CI test run.

---

## 11. Directory Reference

```
sales-portal-robot-tests/
├── .github/
│   └── workflows/
│       ├── build.yml              # PR lint + type check
│       └── tests.yml              # Full test run + Allure deploy
├── .husky/ (or .pre-commit-config.yaml)
├── pyproject.toml                 # Python deps + mypy + ruff config
├── robot.toml                     # RF defaults (variablefiles, outputdir, loglevel)
├── Makefile                       # Convenience targets
│
├── variables/
│   ├── env.py                     # .env loader → RF variables
│   ├── api_config.py              # Endpoint URL constants + builder functions
│   └── constants.py               # Timeouts, viewport, default values
│
├── libraries/                     # Python keyword libraries
│   ├── api/
│   │   ├── __init__.py
│   │   ├── api_client.py          # ApiClientLibrary — requests wrapper + Allure attach
│   │   ├── response.py            # ApiResponse dataclass
│   │   └── endpoints/
│   │       ├── login_api_library.py
│   │       ├── products_api_library.py
│   │       ├── customers_api_library.py
│   │       ├── orders_api_library.py
│   │       └── notifications_api_library.py
│   ├── ui/
│   │   ├── __init__.py
│   │   └── browser_helpers.py     # Custom Browser Library keyword extensions
│   ├── mock/
│   │   ├── __init__.py
│   │   └── mock_library.py        # Network interception keyword library
│   ├── stores/
│   │   ├── __init__.py
│   │   └── entity_store_library.py  # Entity tracking for teardown
│   └── utils/
│       ├── __init__.py
│       ├── validation_library.py  # Validate Response, Validate Json Schema
│       ├── data_generator_library.py  # Generate Product Data, Generate Customer Data, etc.
│       ├── date_utils_library.py  # Date formatting keywords
│       └── notifications/
│           └── telegram_library.py  # Telegram notification keyword
│
├── resources/                     # RF resource files (.resource)
│   ├── api/
│   │   ├── service/
│   │   │   ├── login_service.resource
│   │   │   ├── products_service.resource
│   │   │   ├── customers_service.resource
│   │   │   └── orders_service.resource
│   │   └── facades/
│   │       └── orders_facade.resource
│   └── ui/
│       ├── pages/
│       │   ├── base_page.resource
│       │   ├── sales_portal_page.resource
│       │   ├── base_modal.resource
│       │   ├── login_page.resource
│       │   ├── home_page.resource
│       │   ├── products/
│       │   │   ├── products_list_page.resource
│       │   │   ├── add_new_product_page.resource
│       │   │   ├── edit_product_page.resource
│       │   │   └── product_details_modal.resource
│       │   ├── customers/
│       │   │   ├── customers_list_page.resource
│       │   │   ├── add_new_customer_page.resource
│       │   │   └── customer_details_modal.resource
│       │   └── orders/
│       │       ├── orders_list_page.resource
│       │       ├── order_details_page.resource
│       │       ├── create_order_modal.resource
│       │       └── edit_products_modal.resource
│       └── service/
│           ├── login_ui_service.resource
│           ├── add_new_product_ui_service.resource
│           ├── edit_product_ui_service.resource
│           ├── products_list_ui_service.resource
│           ├── add_new_customer_ui_service.resource
│           ├── customers_list_ui_service.resource
│           ├── order_details_ui_service.resource
│           ├── assign_manager_ui_service.resource
│           └── comments_ui_service.resource
│
├── data/
│   ├── schemas/                   # JSON Schema dicts (Python modules)
│   │   ├── core_schema.py
│   │   ├── products/
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── delivery/
│   │   ├── login/
│   │   └── users/
│   ├── models/                    # Pydantic models (used in keyword libraries)
│   │   ├── product.py
│   │   ├── customer.py
│   │   └── order.py
│   ├── enums/                     # Python enums (Country, Manufacturers, OrderStatus, etc.)
│   │   ├── country.py
│   │   ├── manufacturers.py
│   │   ├── order_status.py
│   │   └── delivery_condition.py
│   ├── ddt/                       # CSV / JSON DDT data files
│   │   ├── create_product_positive.csv
│   │   ├── create_product_negative.csv
│   │   ├── create_customer_positive.csv
│   │   ├── create_order_positive.csv
│   │   └── create_delivery_positive.csv
│   └── generators/                # Python data generator functions
│       ├── __init__.py
│       ├── generate_product_data.py
│       ├── generate_customer_data.py
│       ├── generate_delivery_data.py
│       └── generate_order_data.py
│
├── tests/
│   ├── api/
│   │   ├── products/
│   │   ├── customers/
│   │   └── orders/
│   └── ui/
│       ├── auth_setup.robot
│       ├── orders/
│       └── integration/
│
├── src/.auth/
│   └── user.json                  # Generated browser storage state
│
├── results/                       # RF output: log.html, report.html, output.xml
├── allure-results/                # Allure raw data
├── allure-report/                 # Generated Allure HTML report
├── scripts/
│   └── notify_telegram.py         # CI Telegram notification script
└── .env / .env.dev / .env.dist
```

---

## 12. Framework Comparison Map

| Concern                  | TypeScript / Playwright Test                | Python / pytest + Playwright              | Robot Framework / Browser Library                           |
| ------------------------ | ------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| **Runner**               | `@playwright/test`                          | `pytest`                                  | `robot` / `pabot`                                           |
| **Browser automation**   | `@playwright/test` built-in                 | `playwright` sync API                     | `robotframework-browser` (Playwright)                       |
| **API calls**            | `APIRequestContext`                         | `APIRequestContext` (Playwright)          | `robotframework-requests` (`requests`)                      |
| **DI / fixtures**        | `test.extend<>()` + `mergeTests()`          | `@pytest.fixture` + `conftest.py`         | `Suite/Test Setup` + `Variables` section                    |
| **Page Objects**         | TS abstract classes                         | Python ABC classes                        | `.resource` files + Python keyword libraries                |
| **Service layer**        | TS service classes                          | Python service classes                    | `.resource` files with composed keywords                    |
| **Facade layer**         | TS facade classes                           | Python facade classes                     | `.resource` files in `facades/`                             |
| **DDT**                  | `for...of` over case arrays                 | `@pytest.mark.parametrize`                | `Test Template` + `DataDriver` (CSV/JSON)                   |
| **Data generation**      | `@faker-js/faker`                           | `faker` (Python)                          | `faker` via Python keyword library                          |
| **Schema validation**    | AJV                                         | `jsonschema`                              | `jsonschema` via Python keyword library                     |
| **Type models**          | TypeScript interfaces                       | Pydantic `BaseModel`                      | Pydantic `BaseModel` (in keyword libs)                      |
| **Cleanup / teardown**   | `cleanup` fixture                           | `yield` fixture + `EntitiesStore`         | `Test Teardown` + `EntityStoreLibrary`                      |
| **Reporting**            | Allure (`allure-playwright`)                | Allure (`allure-pytest`)                  | `log.html` + Allure (`allure-robotframework`)               |
| **Step reporting**       | `@logStep()` → `test.step()`                | `@allure.step()`                          | Keyword names as steps + `allure.step()`                    |
| **Mock / interception**  | `page.route()`                              | `page.route()` via `Mock` class           | `Mock Request` / `Mock Response` keywords                   |
| **Auth / storage state** | `auth.setup.ts`                             | `storage_state_path` session fixture      | `auth_setup.robot` + `Save/Load Storage State`              |
| **Linting (code)**       | ESLint + Prettier                           | ruff + mypy                               | ruff + mypy (for `.py`) + robocop + robotidy (for `.robot`) |
| **CI parallelism**       | Playwright workers                          | `pytest-xdist`                            | `pabot`                                                     |
| **Tags / markers**       | `{ tag: [...] }` Playwright option          | `@pytest.mark.<marker>`                   | `[Tags]` in test cases                                      |
| **Config / env**         | `dotenv` + `env.ts`                         | `python-dotenv` + `config/env.py`         | `python-dotenv` + `variables/env.py`                        |
| **Notifications**        | `TelegramService` + `node-telegram-bot-api` | `TelegramService` + `python-telegram-bot` | Same Python `TelegramService` in `scripts/`                 |
