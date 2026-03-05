*** Settings ***
Documentation       UI test suite setup and teardown keywords for browser context management.

Library             Browser
Variables           variables/env.py
Variables           variables/constants.py


*** Keywords ***
Setup UI Browser Context
    [Documentation]    Creates a browser context with injected storage state and correct viewport.
    New Browser    ${BROWSER}    headless=${HEADLESS}
    New Context
    ...    storageState=${STORAGE_STATE_PATH}
    ...    viewport={'width': ${VIEWPORT_WIDTH}, 'height': ${VIEWPORT_HEIGHT}}
    New Page    about:blank

Teardown UI Browser Context
    [Documentation]    Closes the browser after the test suite.
    Close Browser

Setup Integration Browser
    [Documentation]    Creates a browser instance without context (for per-test context management).
    New Browser    ${BROWSER}    headless=${HEADLESS}

Setup Integration Test Context
    [Documentation]    Creates a fresh browser context with injected auth storage state for one test.
    New Context
    ...    storageState=${STORAGE_STATE_PATH}
    ...    viewport={'width': ${VIEWPORT_WIDTH}, 'height': ${VIEWPORT_HEIGHT}}
    New Page    about:blank

Teardown Integration Test Context
    [Documentation]    Closes the current context after a test, discarding any auth state changes.
    Close Context

Teardown Integration Browser
    [Documentation]    Closes the browser after all integration tests.
    Close Browser

Take Screenshot On Failure
    [Documentation]    Captures a screenshot when the current test has failed.
    Run Keyword If Test Failed
    ...    Take Screenshot    filename=${TEST NAME}-failure.png
