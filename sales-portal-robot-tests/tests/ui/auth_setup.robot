*** Settings ***
Documentation    Generates browser storage state with admin session.
Library          OperatingSystem
Library          Browser

Variables        variables/env.py
Variables        variables/constants.py


*** Test Cases ***
Generate Admin Storage State
    [Documentation]    Logs in as admin and saves browser storage state for reuse in UI tests.
    [Tags]    setup
    Prepare Auth Directory
    Perform Login And Save State


*** Keywords ***
Prepare Auth Directory
    [Documentation]    Creates the directory that will hold the browser storage state file.
    ${auth_dir}=    Evaluate    os.path.dirname("${STORAGE_STATE_PATH}")    os
    Create Directory    ${auth_dir}

Perform Login And Save State
    [Documentation]    Opens a browser, logs in as admin, saves storage state, then closes the browser.
    New Browser    ${BROWSER}    headless=${HEADLESS}
    New Context    viewport={'width': ${VIEWPORT_WIDTH}, 'height': ${VIEWPORT_HEIGHT}}
    New Page    ${SALES_PORTAL_URL}/\#/login
    Fill Text    css=#emailinput    ${USER_NAME}
    Fill Text    css=#passwordinput    ${USER_PASSWORD}
    Click    css=button[type='submit']
    Wait For Elements State    css=.welcome-text    visible    timeout=${DEFAULT_TIMEOUT}
    ${state_path}=    Save Storage State
    Copy File    ${state_path}    ${STORAGE_STATE_PATH}
    Close Browser
