*** Settings ***
Documentation    UI test suite setup and teardown keywords for browser context management.
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
    [Documentation]    Closes the browser after the test suite.
    Close Browser
