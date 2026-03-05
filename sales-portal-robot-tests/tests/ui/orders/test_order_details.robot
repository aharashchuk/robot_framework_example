*** Settings ***
Documentation       UI tests — Order Details page (header controls by status)
Metadata            Suite        UI
Metadata            Sub-Suite    Orders

Library             Browser
Library             libraries/stores/entity_store_library.py    AS    EntityStore

Resource            resources/ui/ui_suite_setup.resource
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/orders_service.resource
Resource            resources/ui/pages/orders/order_details_page.resource

Suite Setup         Setup UI Suite
Suite Teardown      Teardown UI Browser Context
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}
Test Tags           ui    orders


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Draft Order Without Delivery — Cancel Visible, Process And Reopen Absent
    [Documentation]    Draft order without delivery: Cancel visible; Process and Reopen not rendered.
    [Tags]    smoke
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page

    Get Element States    ${CANCEL_ORDER_BTN}    *=    visible
    Get Element Count    ${PROCESS_ORDER_BTN}    ==    0
    Get Element Count    ${REOPEN_ORDER_BTN}    ==    0

Draft Order With Delivery — Process Button Visible
    [Documentation]    Draft order with delivery: Process button should be rendered and visible.
    [Tags]    regression
    ${delivery_resp}=    Create Order With Delivery And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${delivery_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page

    Get Element States    ${PROCESS_ORDER_BTN}    *=    visible

Canceled Order — Reopen Visible, Cancel And Process Absent
    [Documentation]    Canceled order: Reopen visible; Cancel and Process not rendered.
    [Tags]    regression
    ${cancel_resp}=    Create Canceled Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${cancel_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page

    Get Element States    ${REOPEN_ORDER_BTN}    *=    visible
    Get Element Count    ${CANCEL_ORDER_BTN}    ==    0
    Get Element Count    ${PROCESS_ORDER_BTN}    ==    0

Draft Order — Customer And Product Sections Visible With Edit Pencils
    [Documentation]    Draft order: customer and product sections visible with edit pencils.
    [Tags]    regression
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page

    Get Element States    ${CUSTOMER_SECTION}    *=    visible
    Get Element States    ${PRODUCTS_SECTION}    *=    visible
    Get Element States    ${EDIT_CUSTOMER_PENCIL}    *=    visible
    Get Element States    ${EDIT_PRODUCTS_PENCIL}    *=    visible


*** Keywords ***
Setup UI Suite
    [Documentation]    Gets admin token and sets up browser context with auth state.
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE    # robocop: off=VAR05
    Setup UI Browser Context
