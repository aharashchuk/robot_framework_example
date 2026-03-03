*** Settings ***
Documentation    API tests — DELETE /api/orders/{id} (Delete Order)
Metadata         Suite        API
Metadata         Sub-Suite    Orders

Library    libraries/api/endpoints/orders_api_library.py    WITH NAME    OrdersApi

Resource    resources/api/api_test_setup.resource
Resource    resources/api/service/orders_service.resource

Suite Setup     Setup Admin Token
Test Teardown   Full Delete Entities    ${ADMIN_TOKEN}


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Delete Order — Existing order returns 204
    [Tags]    smoke    regression    api    orders
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${response}=    OrdersApi.Delete Order    ${ADMIN_TOKEN}    ${order_id}
    Should Be Equal As Integers    ${response.status}    204

Delete Order — Non-existent order returns 404
    [Tags]    regression    api    orders
    ${response}=    OrdersApi.Delete Order    ${ADMIN_TOKEN}    000000000000000000000001
    Validation.Validate Response    ${response}    404


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
