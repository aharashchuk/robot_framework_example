*** Settings ***
Documentation       Assign Manager UI service keywords — manager assignment and unassignment via the UI.

Resource            resources/ui/pages/orders/order_details_page.resource
Resource            resources/ui/pages/base_modal.resource


*** Variables ***
${ASSIGN_MANAGER_MODAL}         css=\#assign-manager-modal
${MANAGER_LIST}                 css=\#manager-list
${UPDATE_MANAGER_BTN}           css=\#update-manager-btn
${CANCEL_ASSIGN_MODAL_BTN}      css=\#cancel-edit-manager-modal-btn
${ASSIGNED_MANAGER_CONTAINER}   css=\#assigned-manager-container


*** Keywords ***
Open Assign Manager Modal Via UI
    [Documentation]    Clicks the assign manager trigger (when unassigned) or edit button (when assigned).
    ${has_trigger}=    Get Element Count    css=#assigned-manager-container u
    IF    ${has_trigger} > 0
        Click    css=#assigned-manager-container u
    ELSE
        Click    css=button[title="Edit Assigned Manager"]
    END
    Wait For Elements State    ${ASSIGN_MANAGER_MODAL}    visible    timeout=${DEFAULT_TIMEOUT}

Assign Manager Via UI
    [Documentation]    Opens the assign manager modal and selects a manager by display name, then saves.
    [Arguments]    ${order_id}    ${manager_name}
    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Open Assign Manager Modal Via UI
    Click    css=#manager-list li:has-text("${manager_name}")
    Wait For Elements State    ${UPDATE_MANAGER_BTN}    enabled    timeout=${DEFAULT_TIMEOUT}
    Click    ${UPDATE_MANAGER_BTN}
    Wait For Elements State    ${ASSIGN_MANAGER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Spinner To Disappear

Assign First Available Manager Via UI
    [Documentation]    Opens the assign manager modal, selects the first listed manager and saves.
    ...    Returns the name text of the selected manager.
    [Arguments]    ${order_id}
    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Open Assign Manager Modal Via UI
    ${first_manager}=    Get Text    css=#manager-list li:first-child
    Click    css=#manager-list li:first-child
    Wait For Elements State    ${UPDATE_MANAGER_BTN}    enabled    timeout=${DEFAULT_TIMEOUT}
    Click    ${UPDATE_MANAGER_BTN}
    Wait For Elements State    ${ASSIGN_MANAGER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Spinner To Disappear
    RETURN    ${first_manager}

Unassign Manager Via UI
    [Documentation]    Clicks the Remove Assigned Manager button and confirms in the modal.
    [Arguments]    ${order_id}
    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Click    css=button[title="Remove Assigned Manager"]
    Confirm Action In Modal

Verify Manager Assigned Via UI
    [Documentation]    Verifies the assigned manager name is visible in the manager container.
    [Arguments]    ${manager_name}
    Get Text    ${ASSIGNED_MANAGER_CONTAINER}    contains    ${manager_name}

Verify No Manager Assigned Via UI
    [Documentation]    Verifies the "Click to select manager" trigger is visible (no manager assigned).
    Wait For Elements State    css=#assigned-manager-container u    visible    timeout=${DEFAULT_TIMEOUT}
