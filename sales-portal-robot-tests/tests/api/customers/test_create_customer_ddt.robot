*** Settings ***
Documentation       API tests — POST /api/customers — DDT negative cases
Metadata            Suite    API
Metadata            Sub-Suite    Customers

Library             DataDriver    file=data/ddt/create_customer_negative.csv    dialect=excel
Library             libraries/api/endpoints/customers_api_library.py    AS    CustomersApi
Resource            resources/api/api_test_setup.resource
Resource            resources/api/service/orders_service.resource

Suite Setup         Setup Admin Token
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}
Test Template       Create Customer With Invalid Data Should Fail

Test Tags           api    customers    regression


*** Variables ***
${ADMIN_TOKEN}      ${EMPTY}


*** Test Cases ***
Create Customer — Negative: ${case_name}    # robocop: off=LEN05
    [Tags]    ddt


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE

Create Customer With Invalid Data Should Fail
    [Arguments]    ${case_name}    ${email}    ${name}    ${country}    ${city}    ${street}
    ...    ${house}    ${flat}    ${phone}    ${expected_status}    ${expected_error}
    ${int_house}=    Convert To Integer    ${house}
    ${int_flat}=    Convert To Integer    ${flat}
    VAR    &{data}
    ...    email=${email}    name=${name}    country=${country}    city=${city}
    ...    street=${street}    house=${int_house}    flat=${int_flat}    phone=${phone}
    ${response}=    CustomersApi.Create Customer    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    ${expected_status}
    Should Contain    ${response.body["ErrorMessage"]}    ${expected_error}
