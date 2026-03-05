*** Settings ***
Documentation       UI tests — Assign and unassign manager on order details page
Metadata            Suite        UI
Metadata            Sub-Suite    Orders

Library             Browser
Library             libraries/stores/entity_store_library.py    AS    EntityStore

Resource            resources/ui/ui_suite_setup.resource
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/orders_service.resource
Resource            resources/ui/pages/orders/order_details_page.resource
Resource            resources/ui/service/assign_manager_ui_service.resource

Variables           variables/api_config.py

Suite Setup         Setup UI Suite
Suite Teardown      Teardown UI Browser Context
Test Teardown       Run Keywords    Take Screenshot On Failure    AND    Full Delete Entities    ${ADMIN_TOKEN}
Test Tags           ui    orders


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Assign Manager — Modal Lists Available Managers
    [Documentation]    Opens assign-manager modal; verifies manager list is non-empty; closes modal.
    [Tags]    smoke
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Open Assign Manager Modal Via UI
    ${count}=    Get Element Count    ${MANAGER_LIST}
    Should Be True    ${count} > 0    Expected at least one manager in the modal
    Click    ${CANCEL_ASSIGN_MODAL_BTN}
    Wait For Elements State    ${ASSIGN_MANAGER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}

Assign Manager — Manager Assigned And Visible
    [Documentation]    Assigns the first available manager; verifies manager name appears in container.
    [Tags]    regression
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    ${manager_name}=    Assign First Available Manager Via UI    ${order_id}
    Verify Manager Assigned Via UI    ${manager_name}

Cancel Manager Assignment — No Manager Assigned
    [Documentation]    Opens assign-manager modal and cancels; manager remains unassigned.
    [Tags]    regression
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Verify No Manager Assigned Via UI
    Open Assign Manager Modal Via UI
    Click    ${CANCEL_ASSIGN_MODAL_BTN}
    Wait For Elements State    ${ASSIGN_MANAGER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Verify No Manager Assigned Via UI

Manager Assignment Persists After Page Refresh
    [Documentation]    Assigns manager; reloads page; verifies manager is still shown.
    [Tags]    regression
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    ${manager_name}=    Assign First Available Manager Via UI    ${order_id}
    Verify Manager Assigned Via UI    ${manager_name}
    Reload
    Wait For Order Details Page
    Verify Manager Assigned Via UI    ${manager_name}

Unassign Manager — Assign Trigger Visible Again
    [Documentation]    Assigns then unassigns a manager; assign-trigger should be visible again.
    [Tags]    regression
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Assign First Available Manager Via UI    ${order_id}
    Unassign Manager Via UI    ${order_id}
    Verify No Manager Assigned Via UI


*** Keywords ***
Setup UI Suite
    [Documentation]    Gets admin token and sets up browser context with auth state.
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE    # robocop: off=VAR05
    Setup UI Browser Context
