*** Settings ***
Documentation    API tests — POST /api/orders/{id}/delivery (Order Delivery)
Metadata         Suite        API
Metadata         Sub-Suite    Orders

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
Add Delivery — Valid data returns 200
    [Tags]    smoke    regression    api    orders
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${delivery_data}=    DataGen.Generate Delivery Data
    ${response}=    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    ${order_id}    ${delivery_data}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Update Delivery — Re-scheduling returns 200
    [Tags]    regression    api    orders
    ${order_resp}=    Create Order With Delivery And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${new_delivery_data}=    DataGen.Generate Delivery Data
    ${response}=    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    ${order_id}    ${new_delivery_data}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Add Delivery — Non-existent order returns 404
    [Tags]    regression    api    orders
    ${delivery_data}=    DataGen.Generate Delivery Data
    ${response}=    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    000000000000000000000001    ${delivery_data}
    Validation.Validate Response    ${response}    404

Add Delivery — Invalid condition returns 400
    [Tags]    regression    api    orders
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${invalid_delivery}=    Create Dictionary    condition=InvalidCondition
    ${response}=    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    ${order_id}    ${invalid_delivery}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
