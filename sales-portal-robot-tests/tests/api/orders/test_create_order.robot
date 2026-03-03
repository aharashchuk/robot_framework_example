*** Settings ***
Documentation    API tests — POST /api/orders (Create Order)
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
Create Order — Positive: Single product
    [Tags]    smoke    regression    api    orders
    [Documentation]    POST /api/orders with one product returns 201 and correct schema.
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    1
    Validation.Validate Response    ${order_resp}    201    ${CREATE_ORDER_SCHEMA}

Create Order — Positive: Multiple products
    [Tags]    regression    api    orders
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    3
    Validation.Validate Response    ${order_resp}    201    ${CREATE_ORDER_SCHEMA}

Create Order — Negative: No products returns 400
    [Tags]    regression    api    orders
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_id}=    ${customer_resp.body["Customer"]["_id"]}
    @{empty_products}=    Create List
    ${order_data}=    Create Dictionary    customer=${customer_id}    products=${empty_products}
    ${response}=    OrdersApi.Create Order    ${ADMIN_TOKEN}    ${order_data}
    Validation.Validate Response    ${response}    400

Create Order — Negative: Non-existent customer returns 404
    [Tags]    regression    api    orders
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_id}=    ${product_resp.body["Product"]["_id"]}
    @{product_ids}=    Create List    ${product_id}
    ${order_data}=    Create Dictionary    customer=000000000000000000000001    products=${product_ids}
    ${response}=    OrdersApi.Create Order    ${ADMIN_TOKEN}    ${order_data}
    Validation.Validate Response    ${response}    404

Create Order — Negative: Exceed max products returns 400
    [Tags]    regression    api    orders
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_id}=    ${customer_resp.body["Customer"]["_id"]}
    ${product_ids}=    Create N Product Ids And Track    ${ADMIN_TOKEN}    6
    ${order_data}=    Create Dictionary    customer=${customer_id}    products=${product_ids}
    ${response}=    OrdersApi.Create Order    ${ADMIN_TOKEN}    ${order_data}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
