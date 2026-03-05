*** Settings ***
Documentation       UI tests — Order status transitions via UI buttons
Metadata            Suite        UI
Metadata            Sub-Suite    Orders

Library             Browser
Library             libraries/stores/entity_store_library.py    AS    EntityStore

Resource            resources/ui/ui_suite_setup.resource
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/orders_service.resource
Resource            resources/ui/pages/orders/order_details_page.resource
Resource            resources/ui/service/order_details_ui_service.resource

Suite Setup         Setup UI Suite
Suite Teardown      Teardown UI Browser Context
Test Teardown       Run Keywords    Take Screenshot On Failure    AND    Full Delete Entities    ${ADMIN_TOKEN}
Test Tags           ui    orders


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Cancel Draft Order Via UI — Status Changes To Canceled
    [Documentation]    Clicks Cancel on a Draft order; status updates to Canceled.
    [Tags]    smoke
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Change Order Status Via UI    ${order_id}    Cancel
    Wait For Order Details Page
    Verify Order Status    Canceled

Process Draft Order With Delivery Via UI — Status Changes To In Process
    [Documentation]    Clicks Process on a Draft order with delivery; status updates to In Process.
    [Tags]    regression
    ${delivery_resp}=    Create Order With Delivery And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${delivery_resp.body["Order"]["_id"]}

    Change Order Status Via UI    ${order_id}    Process
    Wait For Order Details Page
    Verify Order Status    In Process

Reopen Canceled Order Via UI — Status Changes To Draft
    [Documentation]    Clicks Reopen on a Canceled order; status updates to Draft.
    [Tags]    regression
    ${cancel_resp}=    Create Canceled Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${cancel_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Click Reopen Order
    Confirm Action In Modal
    Wait For Order Details Page
    Verify Order Status    Draft


*** Keywords ***
Setup UI Suite
    [Documentation]    Gets admin token and sets up browser context with auth state.
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE    # robocop: off=VAR05
    Setup UI Browser Context
