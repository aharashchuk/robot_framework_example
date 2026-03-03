*** Settings ***
Documentation    API tests — GET /api/customers (Get Customer)
Metadata         Suite        API
Metadata         Sub-Suite    Customers

Library    libraries/api/endpoints/customers_api_library.py    WITH NAME    CustomersApi

Resource    resources/api/api_test_setup.resource
Resource    resources/api/service/customers_service.resource
Resource    resources/api/service/orders_service.resource

Variables    data/schemas/customers/create_customer_schema.py

Suite Setup     Setup Admin Token
Test Teardown   Full Delete Entities    ${ADMIN_TOKEN}


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Get Customer By ID — Valid ID returns 200 and schema
    [Tags]    smoke    regression    api    customers
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_id}=    ${customer_resp.body["Customer"]["_id"]}
    ${response}=    CustomersApi.Get Customer By Id    ${ADMIN_TOKEN}    ${customer_id}
    Validation.Validate Response    ${response}    200    ${GET_CUSTOMER_SCHEMA}

Get Customer By ID — Non-existent ID returns 404
    [Tags]    regression    api    customers
    ${response}=    CustomersApi.Get Customer By Id    ${ADMIN_TOKEN}    000000000000000000000001
    Validation.Validate Response    ${response}    404

Get All Customers — Returns 200 and schema
    [Tags]    smoke    regression    api    customers
    ${response}=    CustomersApi.Get All Customers    ${ADMIN_TOKEN}
    Validation.Validate Response    ${response}    200    ${GET_ALL_CUSTOMERS_SCHEMA}

Get Customers List — Returns 200
    [Tags]    regression    api    customers
    ${response}=    CustomersApi.Get Customers List    ${ADMIN_TOKEN}
    Validation.Validate Response    ${response}    200


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
