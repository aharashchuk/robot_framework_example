*** Settings ***
Documentation    API tests — POST /api/customers (Create Customer)
Metadata         Suite        API
Metadata         Sub-Suite    Customers

Library    libraries/api/endpoints/customers_api_library.py    WITH NAME    CustomersApi
Library    libraries/utils/data_generator_library.py           WITH NAME    DataGen

Resource    resources/api/api_test_setup.resource
Resource    resources/api/service/customers_service.resource
Resource    resources/api/service/orders_service.resource

Variables    data/schemas/customers/create_customer_schema.py

Suite Setup     Setup Admin Token
Test Teardown   Full Delete Entities    ${ADMIN_TOKEN}


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Create Customer — Positive: Valid data
    [Tags]    smoke    regression    api    customers
    [Documentation]    POST /api/customers with valid data returns 201 and correct schema.
    ${data}=       DataGen.Generate Customer Data
    ${response}=   CustomersApi.Create Customer    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    201    ${CREATE_CUSTOMER_SCHEMA}
    EntityStore.Track Customer    ${response.body["Customer"]["_id"]}

Create Customer — Negative: Empty email
    [Tags]    regression    api    customers
    ${data}=    Create Dictionary
    ...    email=${EMPTY}    name=John Smith    country=USA
    ...    city=New York    street=Main Street 12    house=${10}    flat=${5}    phone=+12025551234
    ${response}=    CustomersApi.Create Customer    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    400

Create Customer — Negative: Invalid email format
    [Tags]    regression    api    customers
    ${data}=    Create Dictionary
    ...    email=not-an-email    name=John Smith    country=USA
    ...    city=New York    street=Main Street 12    house=${10}    flat=${5}    phone=+12025551234
    ${response}=    CustomersApi.Create Customer    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
