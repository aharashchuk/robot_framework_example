*** Settings ***
Documentation       API tests — PUT /api/products/{id} (Update Product)
Metadata            Suite    API
Metadata            Sub-Suite    Products

Library             libraries/api/api_client.py    AS    ApiClient
Library             libraries/api/endpoints/products_api_library.py    AS    ProductsApi
Library             libraries/utils/validation_library.py    AS    Validation
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Library             libraries/utils/data_generator_library.py    AS    DataGen
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/products_service.resource
Resource            resources/api/service/orders_service.resource
Variables           data/schemas/products/create_product_schema.py

Suite Setup         Setup Admin Token
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}

Test Tags           api    products    regression


*** Variables ***
${ADMIN_TOKEN}      ${EMPTY}


*** Test Cases ***
Update Product — Valid data returns 200
    [Tags]    smoke
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_id}=    ${product_resp.body["Product"]["_id"]}
    ${update_data}=    DataGen.Generate Product Data
    ${response}=    ProductsApi.Update Product    ${ADMIN_TOKEN}    ${product_id}    ${update_data}
    Validation.Validate Response    ${response}    200    ${GET_PRODUCT_SCHEMA}

Update Product — Non-existent product returns 404
    ${update_data}=    DataGen.Generate Product Data
    ${response}=    ProductsApi.Update Product    ${ADMIN_TOKEN}    000000000000000000000001    ${update_data}
    Validation.Validate Response    ${response}    404

Update Product — Invalid data returns 400
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_id}=    ${product_resp.body["Product"]["_id"]}
    VAR    &{invalid_data}    name=ValidProduct    amount=${10}    price=${0}    manufacturer=Samsung
    ${response}=    ProductsApi.Update Product    ${ADMIN_TOKEN}    ${product_id}    ${invalid_data}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE
