*** Settings ***
Documentation       Base modal dialog keywords for confirmation-style modals.

Resource            base_page.resource
Variables           variables/constants.py


*** Keywords ***
Wait For Modal To Close
    [Documentation]    Waits for a modal identified by ${modal_selector} to disappear.
    [Arguments]    ${modal_selector}
    Wait For Elements State    ${modal_selector}    hidden    timeout=${DEFAULT_TIMEOUT}

Confirm Action In Modal
    [Documentation]    Clicks the submit/confirm button in the active modal and waits for spinners.
    Click    css=.modal.show .modal-footer button[type='submit']
    Wait For Spinner To Disappear

Cancel Action In Modal
    [Documentation]    Clicks the secondary/cancel button in the active modal.
    Click    css=.modal.show .modal-footer button.btn-secondary
