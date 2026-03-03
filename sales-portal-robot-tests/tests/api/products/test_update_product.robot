*** Settings ***
Documentation    API tests — PUT /api/products/{id} (Update Product)
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
Update Product — Valid data returns 200
    [Tags]    smoke    regression    api    products
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_id}=    ${product_resp.body["Product"]["_id"]}
    ${update_data}=    DataGen.Generate Product Data
    ${response}=    ProductsApi.Update Product    ${ADMIN_TOKEN}    ${product_id}    ${update_data}
    Validation.Validate Response    ${response}    200    ${GET_PRODUCT_SCHEMA}

Update Product — Non-existent product returns 404
    [Tags]    regression    api    products
    ${update_data}=    DataGen.Generate Product Data
    ${response}=    ProductsApi.Update Product    ${ADMIN_TOKEN}    000000000000000000000001    ${update_data}
    Validation.Validate Response    ${response}    404

Update Product — Invalid data returns 400
    [Tags]    regression    api    products
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_id}=    ${product_resp.body["Product"]["_id"]}
    ${invalid_data}=    Create Dictionary    name=ValidProduct    amount=${10}    price=${0}    manufacturer=Samsung
    ${response}=    ProductsApi.Update Product    ${ADMIN_TOKEN}    ${product_id}    ${invalid_data}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
