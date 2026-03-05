*** Settings ***
Documentation       UI tests — Schedule and edit delivery on order details page
Metadata            Suite        UI
Metadata            Sub-Suite    Orders

Library             Browser
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Library             libraries/utils/data_generator_library.py    AS    DataGen

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
Schedule Delivery — Form Opens And Save Disabled Initially
    [Documentation]    Opening schedule-delivery for a draft order shows disabled Save button.
    [Tags]    smoke
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Click Add Delivery Button
    Wait For Elements State    css=#schedule-delivery    visible    timeout=${DEFAULT_TIMEOUT}
    Get Element States    css=#save-delivery    *=    disabled

Schedule Delivery — Delivery Type Saved To Delivery Tab
    [Documentation]    Schedules delivery via UI; verifies the form data appears on the delivery tab.
    [Tags]    regression
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${delivery_data}=    DataGen.Generate Delivery Data

    Fill Order Delivery Via UI    ${order_id}    ${delivery_data}
    Click    ${DELIVERY_TAB}
    Wait For Elements State    css=#delivery    visible    timeout=${DEFAULT_TIMEOUT}
    Get Text    css=#delivery    contains    ${delivery_data}[condition]

Schedule Pickup Delivery — Pickup Type Persists On Delivery Tab
    [Documentation]    Schedules Pickup delivery; delivery tab shows Pickup type.
    [Tags]    regression
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${pickup_data}=    DataGen.Generate Delivery Data    condition=Pickup

    Fill Order Delivery Via UI    ${order_id}    ${pickup_data}
    Click    ${DELIVERY_TAB}
    Wait For Elements State    css=#delivery    visible    timeout=${DEFAULT_TIMEOUT}
    Get Text    css=#delivery    contains    Pickup

Edit Existing Delivery — Shows Edit Delivery Title
    [Documentation]    Opening delivery form when delivery exists shows 'Edit Delivery' title.
    [Tags]    regression
    ${delivery_resp}=    Create Order With Delivery And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${delivery_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Click Add Delivery Button
    Wait For Elements State    css=#delivery-container    visible    timeout=${DEFAULT_TIMEOUT}
    Get Text    css=#delivery-container h2    contains    Edit Delivery


*** Keywords ***
Setup UI Suite
    [Documentation]    Gets admin token and sets up browser context with auth state.
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE    # robocop: off=VAR05
    Setup UI Browser Context
