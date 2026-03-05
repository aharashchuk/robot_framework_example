*** Settings ***
Documentation       API tests — POST /api/customers (Create Customer)
Metadata            Suite    API
Metadata            Sub-Suite    Customers

Library             libraries/api/endpoints/customers_api_library.py    AS    CustomersApi
Library             libraries/utils/data_generator_library.py    AS    DataGen
Resource            resources/api/api_test_setup.resource
Resource            resources/api/service/customers_service.resource
Resource            resources/api/service/orders_service.resource
Variables           data/schemas/customers/create_customer_schema.py

Suite Setup         Setup Admin Token
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}

Test Tags           api    customers    regression


*** Variables ***
${ADMIN_TOKEN}      ${EMPTY}


*** Test Cases ***
Create Customer — Positive: Valid data
    [Documentation]    POST /api/customers with valid data returns 201 and correct schema.
    [Tags]    smoke
    ${data}=    DataGen.Generate Customer Data
    ${response}=    CustomersApi.Create Customer    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    201    ${CREATE_CUSTOMER_SCHEMA}
    EntityStore.Track Customer    ${response.body["Customer"]["_id"]}

Create Customer — Negative: Empty email
    VAR    &{data}
    ...    email=${EMPTY}    name=John Smith    country=USA
    ...    city=New York    street=Main Street 12    house=${10}    flat=${5}    phone=+12025551234
    ${response}=    CustomersApi.Create Customer    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    400

Create Customer — Negative: Invalid email format
    VAR    &{data}
    ...    email=not-an-email    name=John Smith    country=USA
    ...    city=New York    street=Main Street 12    house=${10}    flat=${5}    phone=+12025551234
    ${response}=    CustomersApi.Create Customer    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
