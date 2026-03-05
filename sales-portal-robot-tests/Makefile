.PHONY: install test-api test-ui test-smoke test-all lint setup-auth merge-results

PYTHON    := python
ROBOT     := $(PYTHON) -m robot
REBOT     := $(PYTHON) -m robot.rebot
TEST_ENV  ?= dev

install:
	pip install -e ".[dev]"
	rfbrowser init chromium

setup-auth:
	TEST_ENV=$(TEST_ENV) $(ROBOT) --include setup -d results tests/ui/auth_setup.robot

test-api:
	TEST_ENV=$(TEST_ENV) $(ROBOT) --include api --include regression -d results/api tests/api/

test-ui: setup-auth
	TEST_ENV=$(TEST_ENV) $(ROBOT) --include ui --include regression --exclude setup -d results/ui tests/ui/

test-smoke:
	TEST_ENV=$(TEST_ENV) $(ROBOT) --include smoke -d results tests/

test-all: setup-auth
	TEST_ENV=$(TEST_ENV) $(ROBOT) --include regression --exclude setup -d results tests/

merge-results:
	$(REBOT) --outputdir results --output output.xml results/api/output.xml results/ui/output.xml

lint:
	ruff check libraries/ variables/ data/ scripts/
	mypy libraries/ variables/ data/
	python -m robocop check resources/ tests/
