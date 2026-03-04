*** Settings ***
Documentation       Base page keywords shared by all UI pages.

Library             Browser
Variables           variables/constants.py


*** Keywords ***
Accept Cookies If Present
    [Documentation]    Clicks the cookie accept button if it appears.
    ${visible}=    Run Keyword And Return Status
    ...    Wait For Elements State    css=[data-cy="accept-cookies"]    visible    timeout=${SHORT_TIMEOUT}
    IF    ${visible}    Click    css=[data-cy="accept-cookies"]

Wait For Spinner To Disappear
    [Documentation]    Waits for all loading spinners to become hidden.
    Wait For Elements State    css=.spinner-border    hidden    timeout=${SPINNER_TIMEOUT}
