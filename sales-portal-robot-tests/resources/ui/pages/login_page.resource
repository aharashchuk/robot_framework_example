*** Settings ***
Documentation       Login page keywords.

Resource            sales_portal_page.resource
Variables           variables/env.py


*** Keywords ***
Fill Login Form
    [Documentation]    Fills the email and password fields on the login form.
    [Arguments]    ${username}    ${password}
    Fill Text    css=#emailinput    ${username}
    Fill Text    css=#passwordinput    ${password}

Click Login Button
    [Documentation]    Submits the login form and waits for the spinner to clear.
    Click    css=button[type='submit']
    Wait For Spinner To Disappear

Login Via UI
    [Documentation]    Full login flow: opens login page, fills credentials and submits.
    [Arguments]    ${username}=${USER_NAME}    ${password}=${USER_PASSWORD}
    Open Sales Portal Page    \#/login
    Fill Login Form    ${username}    ${password}
    Click Login Button
