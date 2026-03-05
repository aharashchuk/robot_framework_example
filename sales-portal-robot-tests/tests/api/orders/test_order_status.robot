*** Settings ***
Documentation       API tests — PUT /api/orders/{id}/status (Order Status)
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
Update Status — Draft to In Process returns 200
    [Documentation]    Scheduling delivery is required before moving to In Process.
    [Tags]    smoke
    ${delivery_resp}=    Create Order With Delivery And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${delivery_resp.body["Order"]["_id"]}
    VAR    &{status_body}    status=In Process
    ${response}=    OrdersApi.Update Order Status    ${ADMIN_TOKEN}    ${order_id}    ${status_body}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Update Status — In Process to Canceled returns 200
    ${delivery_resp}=    Create Order With Delivery And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${delivery_resp.body["Order"]["_id"]}
    VAR    &{in_process_body}    status=In Process
    OrdersApi.Update Order Status    ${ADMIN_TOKEN}    ${order_id}    ${in_process_body}
    VAR    &{canceled_body}    status=Canceled
    ${response}=    OrdersApi.Update Order Status    ${ADMIN_TOKEN}    ${order_id}    ${canceled_body}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Update Status — Without delivery returns 400
    [Documentation]    Changing to In Process without delivery scheduled should return 400.
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    &{status_body}    status=In Process
    ${response}=    OrdersApi.Update Order Status    ${ADMIN_TOKEN}    ${order_id}    ${status_body}
    Validation.Validate Response    ${response}    400

Update Status — Invalid status value returns 400
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    &{invalid_status}    status=InvalidStatus
    ${response}=    OrdersApi.Update Order Status    ${ADMIN_TOKEN}    ${order_id}    ${invalid_status}
    Validation.Validate Response    ${response}    400

Update Status — Non-existent order returns 404
    VAR    &{status_body}    status=In Process
    ${response}=    OrdersApi.Update Order Status    ${ADMIN_TOKEN}    000000000000000000000001    ${status_body}
    Validation.Validate Response    ${response}    404


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
