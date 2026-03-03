*** Settings ***
Documentation    API tests — POST /api/products (Create Product)
Metadata         Suite        API
Metadata         Sub-Suite    Products

Library    libraries/api/api_client.py                          WITH NAME    ApiClient
Library    libraries/api/endpoints/products_api_library.py      WITH NAME    ProductsApi
Library    libraries/utils/validation_library.py                WITH NAME    Validation
Library    libraries/stores/entity_store_library.py             WITH NAME    EntityStore
Library    libraries/utils/data_generator_library.py            WITH NAME    DataGen

Resource    resources/api/service/login_service.resource
Resource    resources/api/service/products_service.resource
Resource    resources/api/service/orders_service.resource

Variables    data/schemas/products/create_product_schema.py

Suite Setup     Setup Admin Token
Test Teardown   Full Delete Entities    ${ADMIN_TOKEN}


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Create Product — Positive: Valid data
    [Tags]    smoke    regression    api    products
    [Documentation]    POST /api/products with valid data returns 201 and correct schema.
    ${data}=       DataGen.Generate Product Data
    ${response}=   ProductsApi.Create Product    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    201    ${CREATE_PRODUCT_SCHEMA}
    EntityStore.Track Product    ${response.body["Product"]["_id"]}

Create Product — Negative: Empty name
    [Tags]    regression    api    products
    ${data}=    Create Dictionary    name=${EMPTY}    amount=${10}    price=${999}    manufacturer=Samsung
    ${response}=   ProductsApi.Create Product    ${ADMIN_TOKEN}    ${data}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
