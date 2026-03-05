*** Settings ***
Documentation       API tests — GET /api/orders (Get Order)
Metadata            Suite    API
Metadata            Sub-Suite    Orders

Library             libraries/api/endpoints/orders_api_library.py    AS    OrdersApi
Resource            resources/api/api_test_setup.resource
Resource            resources/api/service/orders_service.resource
Variables           data/schemas/orders/create_order_schema.py

Suite Setup         Setup Admin Token
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}

Test Tags           api    orders    regression


*** Variables ***
${ADMIN_TOKEN}      ${EMPTY}


*** Test Cases ***
Get Order By ID — Valid ID returns 200 and schema
    [Tags]    smoke
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${response}=    OrdersApi.Get Order By Id    ${ADMIN_TOKEN}    ${order_id}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Get Order By ID — Non-existent ID returns 404
    ${response}=    OrdersApi.Get Order By Id    ${ADMIN_TOKEN}    000000000000000000000001
    Validation.Validate Response    ${response}    404

Get All Orders — Returns 200 and schema
    [Tags]    smoke
    ${response}=    OrdersApi.Get All Orders    ${ADMIN_TOKEN}
    Validation.Validate Response    ${response}    200    ${GET_ALL_ORDERS_SCHEMA}


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
