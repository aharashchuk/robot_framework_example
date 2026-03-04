*** Settings ***
Documentation       Sales Portal navigation and common page keywords.

Resource            base_page.resource
Variables           variables/env.py
Variables           variables/constants.py


*** Keywords ***
Open Sales Portal Page
    [Documentation]    Navigates to the given hash route and waits for spinners to clear.
    [Arguments]    ${route}
    Go To    ${SALES_PORTAL_URL}/${route}
    Wait For Spinner To Disappear
    Accept Cookies If Present

Wait For Toast Message
    [Documentation]    Waits for a toast notification to appear; optionally checks its text.
    [Arguments]    ${expected_text}=${EMPTY}
    Wait For Elements State    css=.toast.show    visible    timeout=${TOAST_TIMEOUT}
    IF    "${expected_text}" != "${EMPTY}"
        Get Text    css=.toast-body    ==    ${expected_text}
    END
