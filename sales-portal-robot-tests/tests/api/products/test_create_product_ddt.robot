*** Settings ***
Documentation    API tests — POST /api/products — DDT negative cases
Metadata         Suite        API
Metadata         Sub-Suite    Products

Library    DataDriver    file=data/ddt/create_product_negative.csv    dialect=excel
Library    libraries/api/api_client.py                          WITH NAME    ApiClient
Library    libraries/api/endpoints/products_api_library.py      WITH NAME    ProductsApi
Library    libraries/utils/validation_library.py                WITH NAME    Validation
Library    libraries/stores/entity_store_library.py             WITH NAME    EntityStore

Resource    resources/api/service/login_service.resource
Resource    resources/api/service/orders_service.resource

Test Template    Create Product With Invalid Data Should Fail
Suite Setup      Setup Admin Token
Test Teardown    Full Delete Entities    ${ADMIN_TOKEN}


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Create Product — Negative: ${case_name}
    [Tags]    regression    api    products    ddt


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}

Create Product With Invalid Data Should Fail
    [Arguments]    ${case_name}    ${name}    ${amount}    ${price}    ${manufacturer}
    ...            ${expected_status}    ${expected_error}
    ${int_amount}=    Convert To Integer    ${amount}
    ${int_price}=    Convert To Integer    ${price}
    ${data}=    Create Dictionary
    ...    name=${name}    amount=${int_amount}    price=${int_price}    manufacturer=${manufacturer}
    ${response}=    ProductsApi.Create Product    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    ${expected_status}
    Should Contain    ${response.body["ErrorMessage"]}    ${expected_error}
