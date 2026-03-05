*** Settings ***
Documentation       API tests — POST /api/orders (Create Order)
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
Create Order — Positive: Single product
    [Documentation]    POST /api/orders with one product returns 201 and correct schema.
    [Tags]    smoke
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    1
    Validation.Validate Response    ${order_resp}    201    ${CREATE_ORDER_SCHEMA}

Create Order — Positive: Multiple products
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    3
    Validation.Validate Response    ${order_resp}    201    ${CREATE_ORDER_SCHEMA}

Create Order — Negative: No products returns 400
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_id}=    ${customer_resp.body["Customer"]["_id"]}
    VAR    @{empty_products}
    VAR    &{order_data}    customer=${customer_id}    products=${empty_products}
    ${response}=    OrdersApi.Create Order    ${ADMIN_TOKEN}    ${order_data}
    Validation.Validate Response    ${response}    400

Create Order — Negative: Non-existent customer returns 404
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_id}=    ${product_resp.body["Product"]["_id"]}
    VAR    @{product_ids}    ${product_id}
    VAR    &{order_data}    customer=000000000000000000000001    products=${product_ids}
    ${response}=    OrdersApi.Create Order    ${ADMIN_TOKEN}    ${order_data}
    Validation.Validate Response    ${response}    404

Create Order — Negative: Exceed max products returns 400
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_id}=    ${customer_resp.body["Customer"]["_id"]}
    ${product_ids}=    Create N Product Ids And Track    ${ADMIN_TOKEN}    6
    VAR    &{order_data}    customer=${customer_id}    products=${product_ids}
    ${response}=    OrdersApi.Create Order    ${ADMIN_TOKEN}    ${order_data}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
