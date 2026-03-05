*** Settings ***
Documentation       API tests — POST /api/products — DDT negative cases
Metadata            Suite    API
Metadata            Sub-Suite    Products

Library             DataDriver    file=data/ddt/create_product_negative.csv    dialect=excel
Library             libraries/api/api_client.py    AS    ApiClient
Library             libraries/api/endpoints/products_api_library.py    AS    ProductsApi
Library             libraries/utils/validation_library.py    AS    Validation
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/orders_service.resource

Suite Setup         Setup Admin Token
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}
Test Template       Create Product With Invalid Data Should Fail

Test Tags           api    products    regression


*** Variables ***
${ADMIN_TOKEN}      ${EMPTY}


*** Test Cases ***
Create Product — Negative: ${case_name}    # robocop: off=LEN05
    [Tags]    ddt


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE

Create Product With Invalid Data Should Fail
    [Arguments]    ${case_name}    ${name}    ${amount}    ${price}    ${manufacturer}
    ...    ${expected_status}    ${expected_error}
    ${int_amount}=    Convert To Integer    ${amount}
    ${int_price}=    Convert To Integer    ${price}
    VAR    &{data}
    ...    name=${name}    amount=${int_amount}    price=${int_price}    manufacturer=${manufacturer}
    ${response}=    ProductsApi.Create Product    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    ${expected_status}
    Should Contain    ${response.body["ErrorMessage"]}    ${expected_error}
