*** Settings ***
Documentation       UI tests — Navigation to/from orders pages
Metadata            Suite    UI
Metadata            Sub-Suite    Orders

Library             Browser
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Resource            resources/ui/ui_suite_setup.resource
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/orders_service.resource
Resource            resources/ui/pages/orders/orders_list_page.resource
Resource            resources/ui/pages/orders/order_details_page.resource
Resource            resources/ui/pages/sales_portal_page.resource

Suite Setup         Setup UI Suite
Suite Teardown      Teardown UI Browser Context
Test Teardown       Run Keywords    Take Screenshot On Failure    AND    Full Delete Entities    ${ADMIN_TOKEN}

Test Tags           ui    orders


*** Variables ***
${ADMIN_TOKEN}      ${EMPTY}


*** Test Cases ***
Navigate To Orders List — Direct URL
    [Documentation]    Navigates directly to #/orders; orders list and table are visible.
    [Tags]    smoke
    Open Orders List Page
    Wait For Orders Table

Navigate To Order Details — Click Details From List
    [Documentation]    Creates order; navigates to details page via the Details button.
    [Tags]    regression
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Open Orders List Page
    Wait For Orders Table
    Search Orders    ${order_id}
    Click Order Row    ${order_id}
    Wait For Order Details Page
    Get Text    ${ORDER_DETAILS_HEADER}    contains    ${order_id}

Navigate Back To Orders List — From Order Details
    [Documentation]    Opens order details then navigates back via browser history.
    [Tags]    regression
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Open Orders List Page
    Wait For Orders Table

Navigate To Orders Via Navbar — Navbar Link Active
    [Documentation]    Clicks Orders in navbar; orders list opens and Orders tab is active.
    [Tags]    regression
    Open Sales Portal Page    \#/
    Wait For Spinner To Disappear
    Click    css=a[name="orders"][href="\#/orders"]:not([data-bs-dismiss="offcanvas"])
    Wait For Orders Table
    Get Element States    css=a[name="orders"][href="\#/orders"]:not([data-bs-dismiss="offcanvas"])    *=    visible


*** Keywords ***
Setup UI Suite
    [Documentation]    Gets admin token and sets up browser context with auth state.
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
    Setup UI Browser Context
