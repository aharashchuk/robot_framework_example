*** Settings ***
Documentation       API tests — POST /api/orders/{id}/delivery (Order Delivery)
Metadata            Suite    API
Metadata            Sub-Suite    Orders

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
Add Delivery — Valid data returns 200
    [Tags]    smoke
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${delivery_data}=    DataGen.Generate Delivery Data
    ${response}=    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    ${order_id}    ${delivery_data}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Update Delivery — Re-scheduling returns 200
    ${order_resp}=    Create Order With Delivery And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${new_delivery_data}=    DataGen.Generate Delivery Data
    ${response}=    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    ${order_id}    ${new_delivery_data}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Add Delivery — Non-existent order returns 404
    ${delivery_data}=    DataGen.Generate Delivery Data
    ${response}=    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    000000000000000000000001    ${delivery_data}
    Validation.Validate Response    ${response}    404

Add Delivery — Invalid condition returns 400
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    &{invalid_delivery}    condition=InvalidCondition
    ${response}=    OrdersApi.Add Order Delivery    ${ADMIN_TOKEN}    ${order_id}    ${invalid_delivery}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
