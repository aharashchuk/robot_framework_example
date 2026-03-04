*** Settings ***
Documentation       Login UI service keywords — complete login flows for UI tests.

Resource            resources/ui/pages/login_page.resource
Variables           variables/env.py


*** Keywords ***
Login As Admin Via UI
    [Documentation]    Performs a full login as admin and waits for the home page to load.
    Login Via UI    ${USER_NAME}    ${USER_PASSWORD}
    Wait For Elements State    css=.welcome-text    visible    timeout=${DEFAULT_TIMEOUT}
