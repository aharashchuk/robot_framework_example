*** Settings ***
Documentation       API tests — POST /api/orders/{id}/receive (Receive Order Products)
Metadata            Suite    API
Metadata            Sub-Suite    Orders

Library             Collections
Library             libraries/api/endpoints/orders_api_library.py    AS    OrdersApi
Library             libraries/utils/data_generator_library.py    AS    DataGen
Resource            resources/api/api_test_setup.resource
Resource            resources/api/service/orders_service.resource
Variables           data/schemas/orders/create_order_schema.py

Suite Setup         Setup Admin Token
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}

Test Tags           api    orders    regression


*** Variables ***
${ADMIN_TOKEN}      ${EMPTY}


*** Test Cases ***
Receive Products — Valid product IDs returns 200
    [Documentation]    Order must be In Process (with delivery) before receiving products.
    [Tags]    smoke
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    1
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    ${product_id}=    ${order_resp.body["Order"]["products"][0]["_id"]}
    ${delivery_data}=    DataGen.Generate Delivery Data
    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    ${order_id}    ${delivery_data}
    VAR    &{status_body}    status=In Process
    OrdersApi.Update Order Status    ${ADMIN_TOKEN}    ${order_id}    ${status_body}
    VAR    @{product_ids}    ${product_id}
    VAR    &{receive_body}    products=${product_ids}
    ${response}=    OrdersApi.Receive Order Products    ${ADMIN_TOKEN}    ${order_id}    ${receive_body}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Receive Products — Non-existent order returns 404
    VAR    @{product_ids}    000000000000000000000001
    VAR    &{receive_body}    products=${product_ids}
    ${response}=    OrdersApi.Receive Order Products    ${ADMIN_TOKEN}    000000000000000000000001    ${receive_body}
    Validation.Validate Response    ${response}    404

Receive Products — Empty product list returns 400
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    1
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${delivery_data}=    DataGen.Generate Delivery Data
    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    ${order_id}    ${delivery_data}
    VAR    &{status_body}    status=In Process
    OrdersApi.Update Order Status    ${ADMIN_TOKEN}    ${order_id}    ${status_body}
    VAR    @{empty_products}
    VAR    &{receive_body}    products=${empty_products}
    ${response}=    OrdersApi.Receive Order Products    ${ADMIN_TOKEN}    ${order_id}    ${receive_body}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
