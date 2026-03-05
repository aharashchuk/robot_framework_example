*** Settings ***
Documentation       API tests — GET /api/products (Get Product)
Metadata            Suite    API
Metadata            Sub-Suite    Products

Library             libraries/api/api_client.py    AS    ApiClient
Library             libraries/api/endpoints/products_api_library.py    AS    ProductsApi
Library             libraries/utils/validation_library.py    AS    Validation
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/products_service.resource
Resource            resources/api/service/orders_service.resource
Variables           data/schemas/products/create_product_schema.py
Variables           data/schemas/products/get_all_products_schema.py

Suite Setup         Setup Admin Token
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}

Test Tags           api    products    regression


*** Variables ***
${ADMIN_TOKEN}      ${EMPTY}


*** Test Cases ***
Get Product By ID — Valid ID returns 200 and schema
    [Tags]    smoke
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_id}=    ${product_resp.body["Product"]["_id"]}
    ${response}=    ProductsApi.Get Product By Id    ${ADMIN_TOKEN}    ${product_id}
    Validation.Validate Response    ${response}    200    ${GET_PRODUCT_SCHEMA}

Get Product By ID — Non-existent ID returns 404
    ${response}=    ProductsApi.Get Product By Id    ${ADMIN_TOKEN}    000000000000000000000001
    Validation.Validate Response    ${response}    404

Get All Products — Returns 200 and schema
    [Tags]    smoke
    ${response}=    ProductsApi.Get All Products    ${ADMIN_TOKEN}
    Validation.Validate Response    ${response}    200    ${GET_ALL_PRODUCTS_SCHEMA}

Get Products List — Returns 200
    ${response}=    ProductsApi.Get Products List    ${ADMIN_TOKEN}
    Validation.Validate Response    ${response}    200

Get Products List With Sort Param — Returns 200
    VAR    &{params}    sort=name
    ${response}=    ProductsApi.Get Products List    ${ADMIN_TOKEN}    ${params}
    Validation.Validate Response    ${response}    200


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
