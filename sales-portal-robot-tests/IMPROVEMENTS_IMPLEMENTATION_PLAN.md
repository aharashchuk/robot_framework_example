# Improvements Implementation Plan

Based on the Senior Test Automation Architect review. Items are grouped into phases ordered by risk/impact.

---

## Phase A — Reliability (High Priority)

### A1. Retry logic in `ApiClientLibrary`

**Problem:** Transient network errors or Docker container startup lag cause test failures with no diagnostic value.

**Files:**
- `libraries/api/api_client.py`
- `pyproject.toml` (add `tenacity` dependency)

**Implementation:**

1. Add `tenacity` to `pyproject.toml` under `[project.dependencies]`:
   ```toml
   "tenacity>=8.2",
   ```

2. Wrap `Send API Request` with selective retry — retry on `ConnectionError` / `Timeout`, not on 4xx/5xx:

   ```python
   from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential
   import requests

   _RETRY_EXCEPTIONS = (requests.exceptions.ConnectionError, requests.exceptions.Timeout)

   @retry(
       retry=retry_if_exception_type(_RETRY_EXCEPTIONS),
       stop=stop_after_attempt(3),
       wait=wait_exponential(multiplier=1, min=1, max=5),
       reraise=True,
   )
   def _execute_request(self, method: str, url: str, **kwargs) -> requests.Response:
       return self._session.request(method, url, **kwargs)
   ```

3. Call `_execute_request` from `send_api_request` instead of `self._session.request` directly.

**Acceptance criteria:** Running `test_create_product.robot` while briefly killing and restarting the backend container still passes (within retry window).

---

### A2. `MockLibrary` — remove stale extension guard

**Problem:** `_extension_loaded` instance flag is set to `True` after first `init_js_extension` call. With TEST-scoped library, each test gets a fresh instance, so the flag starts `False` — extension is re-registered per test. This is actually correct behavior for per-test page contexts. However, if future refactoring changes the scope to SUITE, the guard will prevent re-registration on new pages.

**Files:**
- `libraries/mock/mock_library.py`

**Implementation:**

1. Remove the `_extension_loaded` instance flag entirely.
2. Call `browser.init_js_extension(EXTENSION_PATH)` unconditionally on each `_ensure_extension_loaded()` call.
3. Verify that `init_js_extension` is idempotent (calling it twice on the same page does not error). If not, wrap with `try/except` and log a debug message.

   ```python
   def _ensure_extension_loaded(self) -> None:
       browser = self._browser()
       try:
           browser.init_js_extension(EXTENSION_PATH)
       except Exception as exc:  # noqa: BLE001
           logger.debug("Extension already loaded or load failed: %s", exc)
   ```

4. Add an explicit `Reset Mocks` keyword that calls `Clear All Mocks` and re-registers the extension — call it in `Setup Integration Test Context`.

**Acceptance criteria:** Running integration tests 3 times in a row (without restarting the browser suite) produces consistent results.

---

### A3. `scripts/notify_telegram.py` — guard against missing output file

**Problem:** If both API and UI runs produce no output (e.g., import error before any test runs), the merge step is skipped and `results/output.xml` does not exist. The Telegram step then crashes, hiding the actual failure.

**Files:**
- `scripts/notify_telegram.py`

**Implementation:**

```python
def _parse_output(output_xml: Path) -> tuple[int, int, int]:
    if not output_xml.exists():
        return 0, 0, 0

    tree = ET.parse(output_xml)
    ...

def main() -> None:
    ...
    total, passed, failed = _parse_output(output_xml)
    if total == 0 and status == "success":
        status = "failure"

    if not output_xml.exists():
        body = (
            f"<b>Sales Portal Tests</b>\n"
            f"Status: FAILURE\n"
            f"No output.xml found — test run may have crashed before executing any tests."
        )
    else:
        ...  # existing message building
```

**Acceptance criteria:** Deleting `results/output.xml` and running `python scripts/notify_telegram.py success "" results/output.xml` sends a meaningful Telegram message instead of crashing.

---

## Phase B — Correctness (Medium Priority)

### B1. `EntityStoreLibrary` — ordered cleanup sets

**Problem:** Python `set` has no guaranteed iteration order. If a future backend endpoint enforces referential integrity within an entity type (e.g., parent order before child order), teardown may fail intermittently.

**Files:**
- `libraries/stores/entity_store_library.py`

**Implementation:**

Replace `set` with insertion-ordered deduplication using `dict` (keys only):

```python
from typing import TYPE_CHECKING

class EntityStoreLibrary:
    ROBOT_LIBRARY_SCOPE = "TEST"

    def __init__(self) -> None:
        self._products: dict[str, None] = {}
        self._customers: dict[str, None] = {}
        self._orders: dict[str, None] = {}

    def track_product(self, product_id: str) -> None:
        self._products[product_id] = None

    def get_product_ids(self) -> list[str]:
        return list(self._products)

    # same pattern for customers, orders
```

The dict preserves insertion order (Python 3.7+) and `.keys()` deduplicates automatically.

**Acceptance criteria:** `get_product_ids()` returns IDs in the order they were tracked.

---

### B2. `ValidationLibrary` — human-readable schema error messages

**Problem:** Raw `jsonschema.ValidationError` strings are verbose and reference schema internals. Example: `"'Samsung' is not one of ['Apple', 'Google', ...]"` is useful, but `"Failed validating 'enum' in schema['properties']['manufacturer']"` is not.

**Files:**
- `libraries/utils/validation_library.py`

**Implementation:**

```python
import jsonschema

def validate_schema(self, response_body: dict, schema: dict) -> None:
    validator = jsonschema.Draft7Validator(schema)
    errors = list(validator.iter_errors(response_body))
    for error in sorted(errors, key=lambda e: list(e.absolute_path)):
        path = " -> ".join(str(p) for p in error.absolute_path) or "root"
        self._errors.append(f"[Schema] '{path}': {error.message}")
```

This produces: `[Schema] 'manufacturer': 'bad_value' is not one of ['Apple', 'Google']`
instead of the full jsonschema traceback.

**Acceptance criteria:** A deliberately invalid API response produces a `ValidationError` with path-prefixed messages only (no schema internals in the message text).

---

### B3. URL building — use `urllib.parse` for query strings

**Problem:** `api_config.py` uses f-strings for all URL building. Query parameters with special characters (spaces, `+`, `&`) will produce malformed URLs when the backend adds filter/search endpoints.

**Files:**
- `variables/api_config.py`

**Implementation:**

Add a helper used by any URL builder that accepts query parameters:

```python
from urllib.parse import urlencode, urljoin

def _build_url(base: str, path: str, **query_params: object) -> str:
    url = f"{base}{path}"
    if query_params:
        url = f"{url}?{urlencode({k: v for k, v in query_params.items() if v is not None})}"
    return url
```

Update any builder functions that construct query strings to use `_build_url`. Existing path-only builders (no query params) do not need to change.

**Acceptance criteria:** `_build_url(BASE, "/api/orders", search="test order", page=1)` produces `http://localhost:8686/api/orders?search=test+order&page=1` with proper encoding.

---

### B4. `data_generator_library.py` — decouple `generate_order_data` from product IDs

**Problem:** `generate_order_data` currently accepts a `product_ids` list. Callers must track which product IDs to pass; if they pass IDs from untracked products, `EntityStoreLibrary` won't clean them up.

**Files:**
- `libraries/utils/data_generator_library.py`
- `resources/api/service/orders_service.resource` (update callers if needed)

**Implementation:**

Make `generate_order_data` accept `product_count: int = 1` and return an `OrderData` with placeholder product IDs (`[]`). The service keyword (`Create Order And Track`) is responsible for injecting real product IDs before the request:

```python
def generate_order_data(self, product_count: int = 1, **overrides) -> OrderData:
    # returns OrderData with products=[] — caller must inject IDs
    return OrderData(
        customer_id="",      # injected by service keyword
        products=[],         # injected by service keyword
        notes=fake.sentence() if random.random() > 0.5 else None,
        **overrides,
    )
```

In `orders_service.resource`, the `Create Order And Track` keyword creates customers + products, then injects their IDs into the order data dict before calling the API. This is already how many tests work; the generator just shouldn't accept raw IDs as input.

**Acceptance criteria:** `Generate Order Data` called with `product_count=2` returns an `OrderData` with two empty product slot placeholders; no external product IDs are required.

---

## Phase C — Maintainability (Low Priority)

### C1. `tests/api/__init__.robot` — suite-level token acquisition

**Problem:** Every API test suite file repeats `Suite Setup    Get Admin Token` and imports `resources/api/api_test_setup.resource`. With 15+ suites, this is boilerplate that a new test author can forget.

**Files:**
- `tests/api/__init__.robot`
- All `tests/api/**/*.robot` suite files (remove duplicate suite setup)

**Implementation:**

1. Promote the admin token acquisition to `tests/api/__init__.robot`:

   ```robot
   *** Settings ***
   Resource    resources/api/api_test_setup.resource

   Suite Setup    Get Admin Token
   ```

2. Remove `Suite Setup    Get Admin Token` from individual suite files. Each suite still imports `api_test_setup.resource` for its own library imports, but the token setup runs once at the `tests/api/` directory level.

3. Verify `${ADMIN_TOKEN}` set via `VAR scope=SUITE` in `Get Admin Token` propagates correctly to child suites (it does in RF — suite variables set in `__init__` are visible to child suites).

**Note:** This is a behavioral change — token is acquired once per `tests/api/` run instead of once per suite file. If a single suite is run in isolation (`python -m robot tests/api/products/`), the `__init__.robot` still runs first, so behavior is consistent.

**Acceptance criteria:** Running `python -m robot tests/api/` acquires the token exactly once. Running `python -m robot tests/api/products/` also acquires the token exactly once (via `__init__.robot`).

---

### C2. `resources/ui/pages/base_page.resource` — `Wait For SPA Ready` keyword

**Problem:** Several UI service keywords navigate and immediately interact. `Go To` resolves on `load` event, not on SPA component render completion.

**Files:**
- `resources/ui/pages/base_page.resource`
- `resources/ui/service/*.resource` (update navigation keywords to call `Wait For SPA Ready`)

**Implementation:**

Add a parameterized keyword that waits for both spinner absence and a page-specific sentinel:

```robot
Wait For Page Ready
    [Documentation]    Waits for spinner to disappear after navigation.
    [Arguments]    ${sentinel_locator}=${EMPTY}
    Wait For Spinner To Disappear
    IF    '${sentinel_locator}' != '${EMPTY}'
        Wait For Elements State    ${sentinel_locator}    visible    timeout=${DEFAULT_TIMEOUT}
    END
```

Update each service keyword that calls `Go To` to follow with `Wait For Page Ready    sentinel_locator=<page-specific element>`.

Example sentinels:
- Orders list: `css=#table-orders`
- Order details: `css=#comments-tab-container`
- Customers list: `css=#table-customers`
- Products list: `css=#table-products`

**Acceptance criteria:** UI tests pass reliably at `HEADLESS=True` on a CI runner with no artificial sleeps added.

---

### C3. `resources/api/facades/orders_facade.resource` — decompose `Create Full Order Lifecycle`

**Problem:** `Create Full Order Lifecycle` is a single large keyword. When it fails mid-lifecycle, the RF log shows a deep call stack with no easy identification of which lifecycle step failed.

**Files:**
- `resources/api/facades/orders_facade.resource`

**Implementation:**

Extract each lifecycle step into its own named keyword, then compose them:

```robot
Create Full Order Lifecycle
    [Arguments]    ${token}
    ${customer_id}=    Lifecycle Step — Create Customer    ${token}
    ${product_id}=     Lifecycle Step — Create Product    ${token}
    ${order_id}=       Lifecycle Step — Create Order    ${token}    ${customer_id}    ${product_id}
    Lifecycle Step — Schedule Delivery    ${token}    ${order_id}
    Lifecycle Step — Process Order    ${token}    ${order_id}
    Lifecycle Step — Receive Order    ${token}    ${order_id}
    RETURN    ${order_id}    ${customer_id}    ${product_id}

Lifecycle Step — Create Customer
    [Arguments]    ${token}
    ${customer_id}=    Create Customer And Track    ${token}
    RETURN    ${customer_id}

# ... etc
```

Individual step keywords can also be called directly from tests that need partial lifecycles (e.g., create order + delivery only, without processing/receiving).

**Acceptance criteria:** A test that fails during "Process Order" step shows `Lifecycle Step — Process Order` as the failing keyword in the RF log, not just `Create Full Order Lifecycle`.

---

### C4. Tagging taxonomy — document and enforce

**Problem:** Tags are used inconsistently across suites. Some files use `orders`, some use `order`. Mixed tags make `--include`/`--exclude` unreliable.

**Files:**
- `CLAUDE.md` (add tagging rules)
- All `tests/**/*.robot` files (audit and normalize tags)

**Tag taxonomy to establish:**

| Tag | Applied to |
|---|---|
| `smoke` | Minimal happy-path tests (1-2 per domain) |
| `regression` | All tests |
| `api` | All API test suites |
| `ui` | All UI test suites |
| `integration` | Mock-based integration tests |
| `login` | Login domain tests |
| `products` | Products domain tests |
| `customers` | Customers domain tests |
| `orders` | Orders domain tests |
| `notifications` | Notifications domain tests |
| `setup` | Auth setup suite only |

**Implementation:**

1. Audit all `tests/**/*.robot` files for current tags using:
   ```bash
   grep -rh "Test Tags\|^\s*\[Tags\]" tests/
   ```
2. Normalize domain tags to the taxonomy above.
3. Add the taxonomy table to `CLAUDE.md` under a `## Tagging Convention` section.

**Acceptance criteria:** `python -m robot --include smoke tests/` runs exactly the smoke tests. `python -m robot --include api --exclude smoke tests/` runs all non-smoke API tests.

---

### C5. `constants.py` — annotate backend-sourced values

**Problem:** `MAX_ORDER_PRODUCTS = 20` is a backend business rule that will silently diverge if the backend changes it.

**Files:**
- `variables/constants.py`

**Implementation:**

Add inline comments linking business rules to their backend source:

```python
# Backend validation: OrderService.MAX_PRODUCTS_PER_ORDER (orders/order.service.ts)
# Update this if the backend limit changes.
MAX_ORDER_PRODUCTS: int = 20
```

Additionally, consider a smoke test that verifies the limit is enforced:

```robot
Create Order With Max Products Allowed
    [Tags]    smoke    orders    boundary
    # Creates an order with exactly MAX_ORDER_PRODUCTS products — should succeed
    ...

Create Order Exceeding Max Products
    [Tags]    orders    negative
    # Creates an order with MAX_ORDER_PRODUCTS + 1 products — should return 400
    ...
```

**Acceptance criteria:** The constant has a comment explaining its origin. A boundary test verifies the backend still enforces the same limit.

---

## Phase D — Scalability (Future)

### D1. Parallel execution readiness (`pabot`)

**Problem:** `ApiClientLibrary` has `GLOBAL` scope — a single `requests.Session` shared across all parallel workers will cause race conditions (shared cookies/headers mutation).

**Files:**
- `libraries/api/api_client.py`
- `pyproject.toml` (add `robotframework-pabot`)

**Implementation:**

1. Change `ROBOT_LIBRARY_SCOPE = "GLOBAL"` to `"SUITE"` in `ApiClientLibrary`. Each suite gets its own `requests.Session`.
2. Update endpoint libraries: they already resolve `ApiClient` via `BuiltIn().get_library_instance("ApiClient")` which will now return the suite-local instance — no change needed.
3. Add `robotframework-pabot` to `[project.optional-dependencies]`:
   ```toml
   [project.optional-dependencies]
   parallel = ["robotframework-pabot>=2.18"]
   ```
4. Add a `Makefile` target:
   ```makefile
   test-api-parallel:
       TEST_ENV=dev python -m pabot --processes 4 --outputdir results/api tests/api/
   ```

**Note:** UI tests cannot be parallelized without a Selenium Grid or Playwright sharding — defer UI parallelization.

**Acceptance criteria:** `make test-api-parallel` runs API tests across 4 workers with no session contamination (all tests pass, no `401 Unauthorized` errors from shared auth state).

---

## Implementation Order Summary

| Phase | Items | Effort | Impact |
|---|---|---|---|
| A — Reliability | A1 (retry), A2 (mock guard), A3 (telegram guard) | Low | High |
| B — Correctness | B1 (entity store order), B2 (schema errors), B3 (URL building), B4 (order data) | Medium | Medium |
| C — Maintainability | C1 (init.robot token), C2 (SPA ready), C3 (facade decompose), C4 (tags), C5 (constants) | Medium | Low-Medium |
| D — Scalability | D1 (pabot parallel) | High | Low (until suite scales) |

Start with Phase A — all three items are small, self-contained, and directly improve test reliability in CI.
