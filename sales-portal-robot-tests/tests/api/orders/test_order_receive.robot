*** Settings ***
Documentation    API tests — POST /api/orders/{id}/receive (Receive Order Products)
Metadata         Suite        API
Metadata         Sub-Suite    Orders

Library    Collections
Library    libraries/api/endpoints/orders_api_library.py    WITH NAME    OrdersApi
Library    libraries/utils/data_generator_library.py        WITH NAME    DataGen

Resource    resources/api/api_test_setup.resource
Resource    resources/api/service/orders_service.resource

Variables    data/schemas/orders/create_order_schema.py

Suite Setup     Setup Admin Token
Test Teardown   Full Delete Entities    ${ADMIN_TOKEN}


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Receive Products — Valid product IDs returns 200
    [Tags]    smoke    regression    api    orders
    [Documentation]    Order must be In Process (with delivery) before receiving products.
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    1
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    ${product_id}=    ${order_resp.body["Order"]["products"][0]["_id"]}
    ${delivery_data}=    DataGen.Generate Delivery Data
    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    ${order_id}    ${delivery_data}
    ${status_body}=    Create Dictionary    status=In Process
    OrdersApi.Update Order Status    ${ADMIN_TOKEN}    ${order_id}    ${status_body}
    @{product_ids}=    Create List    ${product_id}
    ${receive_body}=    Create Dictionary    products=${product_ids}
    ${response}=    OrdersApi.Receive Order Products    ${ADMIN_TOKEN}    ${order_id}    ${receive_body}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Receive Products — Non-existent order returns 404
    [Tags]    regression    api    orders
    @{product_ids}=    Create List    000000000000000000000001
    ${receive_body}=    Create Dictionary    products=${product_ids}
    ${response}=    OrdersApi.Receive Order Products    ${ADMIN_TOKEN}    000000000000000000000001    ${receive_body}
    Validation.Validate Response    ${response}    404

Receive Products — Empty product list returns 400
    [Tags]    regression    api    orders
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    1
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${delivery_data}=    DataGen.Generate Delivery Data
    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    ${order_id}    ${delivery_data}
    ${status_body}=    Create Dictionary    status=In Process
    OrdersApi.Update Order Status    ${ADMIN_TOKEN}    ${order_id}    ${status_body}
    @{empty_products}=    Create List
    ${receive_body}=    Create Dictionary    products=${empty_products}
    ${response}=    OrdersApi.Receive Order Products    ${ADMIN_TOKEN}    ${order_id}    ${receive_body}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
