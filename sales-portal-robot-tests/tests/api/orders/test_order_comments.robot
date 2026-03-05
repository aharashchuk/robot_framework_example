*** Settings ***
Documentation       API tests — POST/DELETE /api/orders/{id}/comments (Order Comments)
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
Add Comment — Valid text returns 200
    [Tags]    smoke
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    &{comment_body}    comment=Test comment text
    ${response}=    OrdersApi.Add Order Comment    ${ADMIN_TOKEN}    ${order_id}    ${comment_body}
    Validation.Validate Response    ${response}    200    ${GET_ORDER_SCHEMA}

Delete Comment — Existing comment returns 204
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    &{comment_body}    comment=Comment to delete
    OrdersApi.Add Order Comment    ${ADMIN_TOKEN}    ${order_id}    ${comment_body}
    ${get_resp}=    OrdersApi.Get Order By Id    ${ADMIN_TOKEN}    ${order_id}
    VAR    ${comment_id}=    ${get_resp.body["Order"]["comments"][-1]["_id"]}
    ${response}=    OrdersApi.Delete Order Comment    ${ADMIN_TOKEN}    ${order_id}    ${comment_id}
    Should Be Equal As Integers    ${response.status}    204

Add Comment — Empty text returns 400
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    &{comment_body}    comment=${EMPTY}
    ${response}=    OrdersApi.Add Order Comment    ${ADMIN_TOKEN}    ${order_id}    ${comment_body}
    Validation.Validate Response    ${response}    400

Delete Comment — Non-existent comment returns 400
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${response}=    OrdersApi.Delete Order Comment    ${ADMIN_TOKEN}    ${order_id}    000000000000000000000001
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
