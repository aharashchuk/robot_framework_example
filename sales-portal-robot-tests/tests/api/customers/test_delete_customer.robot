*** Settings ***
Documentation       API tests — DELETE /api/customers/{id} (Delete Customer)
Metadata            Suite    API
Metadata            Sub-Suite    Customers

Library             libraries/api/endpoints/customers_api_library.py    AS    CustomersApi
Resource            resources/api/api_test_setup.resource
Resource            resources/api/service/customers_service.resource
Resource            resources/api/service/orders_service.resource

Suite Setup         Setup Admin Token
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}

Test Tags           api    customers    regression


*** Variables ***
${ADMIN_TOKEN}      ${EMPTY}


*** Test Cases ***
Delete Customer — Existing customer returns 204
    [Tags]    smoke
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_id}=    ${customer_resp.body["Customer"]["_id"]}
    ${response}=    CustomersApi.Delete Customer    ${ADMIN_TOKEN}    ${customer_id}
    Should Be Equal As Integers    ${response.status}    204

Delete Customer — Non-existent customer returns 404
    ${response}=    CustomersApi.Delete Customer    ${ADMIN_TOKEN}    000000000000000000000001
    Validation.Validate Response    ${response}    404

Delete Customer — Customer assigned to order cannot be deleted
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    1
    VAR    ${customer_id}=    ${order_resp.body["Order"]["customer"]["_id"]}
    ${response}=    CustomersApi.Delete Customer    ${ADMIN_TOKEN}    ${customer_id}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
