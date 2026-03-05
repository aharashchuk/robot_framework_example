*** Settings ***
Documentation       API tests — PUT /api/orders/{id}/assign-manager and unassign-manager
Metadata            Suite    API
Metadata            Sub-Suite    Orders

Library             libraries/api/endpoints/orders_api_library.py    AS    OrdersApi
Resource            resources/api/api_test_setup.resource
Resource            resources/api/service/orders_service.resource
Variables           data/schemas/orders/create_order_schema.py
Variables           variables/api_config.py

Suite Setup         Setup Suite
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}

Test Tags           api    orders    regression


*** Variables ***
${ADMIN_TOKEN}      ${EMPTY}
${MANAGER_ID}       ${EMPTY}


*** Test Cases ***
Assign Manager — Successful assignment returns 200
    [Tags]    smoke
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${response}=    OrdersApi.Assign Manager To Order    ${ADMIN_TOKEN}    ${order_id}    ${MANAGER_ID}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Unassign Manager — Successfully unassigns returns 200
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    OrdersApi.Assign Manager To Order    ${ADMIN_TOKEN}    ${order_id}    ${MANAGER_ID}
    ${response}=    OrdersApi.Unassign Manager From Order    ${ADMIN_TOKEN}    ${order_id}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Assign Manager — Invalid manager ID returns 404
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${response}=    OrdersApi.Assign Manager To Order    ${ADMIN_TOKEN}    ${order_id}    000000000000000000000001
    Validation.Validate Response    ${response}    404


*** Keywords ***
Setup Suite
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
    ${manager_id}=    Get First User Id
    VAR    ${MANAGER_ID}    ${manager_id}    scope=SUITE

Get First User Id
    ${response}=    ApiClient.Send Api Request    GET    ${USERS}    token=${ADMIN_TOKEN}
    Should Be Equal As Integers    ${response.status}    200
    RETURN    ${response.body["Users"][0]["_id"]}
