*** Settings ***
Documentation    API tests — PUT /api/orders/{id} (Update Order)
Metadata         Suite        API
Metadata         Sub-Suite    Orders

Library    Collections
Library    libraries/api/endpoints/orders_api_library.py    WITH NAME    OrdersApi

Resource    resources/api/api_test_setup.resource
Resource    resources/api/service/orders_service.resource

Variables    data/schemas/orders/create_order_schema.py

Suite Setup     Setup Admin Token
Test Teardown   Full Delete Entities    ${ADMIN_TOKEN}


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Update Order — Change customer returns 200
    [Tags]    smoke    regression    api    orders
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    1
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    ${product_id}=    ${order_resp.body["Order"]["products"][0]["_id"]}
    ${new_customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${new_customer_id}=    ${new_customer_resp.body["Customer"]["_id"]}
    @{product_ids}=    Create List    ${product_id}
    ${update_data}=    Create Dictionary    customer=${new_customer_id}    products=${product_ids}
    ${response}=    OrdersApi.Update Order    ${ADMIN_TOKEN}    ${order_id}    ${update_data}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Update Order — Non-existent order returns 404
    [Tags]    regression    api    orders
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_id}=    ${customer_resp.body["Customer"]["_id"]}
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_id}=    ${product_resp.body["Product"]["_id"]}
    @{product_ids}=    Create List    ${product_id}
    ${update_data}=    Create Dictionary    customer=${customer_id}    products=${product_ids}
    ${response}=    OrdersApi.Update Order    ${ADMIN_TOKEN}    000000000000000000000001    ${update_data}
    Validation.Validate Response    ${response}    404

Update Order — Empty products returns 400
    [Tags]    regression    api    orders
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    1
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    ${customer_id}=    ${order_resp.body["Order"]["customer"]["_id"]}
    @{empty_products}=    Create List
    ${invalid_data}=    Create Dictionary    customer=${customer_id}    products=${empty_products}
    ${response}=    OrdersApi.Update Order    ${ADMIN_TOKEN}    ${order_id}    ${invalid_data}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
