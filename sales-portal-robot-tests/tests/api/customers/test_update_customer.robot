*** Settings ***
Documentation    API tests — PUT /api/customers/{id} (Update Customer)
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
Update Customer — Valid data returns 200
    [Tags]    smoke    regression    api    customers
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_id}=    ${customer_resp.body["Customer"]["_id"]}
    ${update_data}=    DataGen.Generate Customer Data
    ${response}=    CustomersApi.Update Customer    ${ADMIN_TOKEN}    ${customer_id}    ${update_data}
    Validation.Validate Response    ${response}    200    ${GET_CUSTOMER_SCHEMA}

Update Customer — Non-existent customer returns 404
    [Tags]    regression    api    customers
    ${update_data}=    DataGen.Generate Customer Data
    ${response}=    CustomersApi.Update Customer    ${ADMIN_TOKEN}    000000000000000000000001    ${update_data}
    Validation.Validate Response    ${response}    404

Update Customer — Invalid email returns 400
    [Tags]    regression    api    customers
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_id}=    ${customer_resp.body["Customer"]["_id"]}
    ${invalid_data}=    Create Dictionary
    ...    email=not-an-email    name=John Smith    country=USA
    ...    city=New York    street=Main St 1    house=${10}    flat=${5}    phone=+12025551234
    ${response}=    CustomersApi.Update Customer    ${ADMIN_TOKEN}    ${customer_id}    ${invalid_data}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
