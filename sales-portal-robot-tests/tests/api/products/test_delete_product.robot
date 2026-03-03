*** Settings ***
Documentation    API tests — DELETE /api/products/{id} (Delete Product)
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

Suite Setup     Setup Admin Token
Test Teardown   Full Delete Entities    ${ADMIN_TOKEN}


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Delete Product — Existing product returns 204
    [Tags]    smoke    regression    api    products
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_id}=    ${product_resp.body["Product"]["_id"]}
    ${response}=    ProductsApi.Delete Product    ${ADMIN_TOKEN}    ${product_id}
    Should Be Equal As Integers    ${response.status}    204

Delete Product — Non-existent product returns 404
    [Tags]    regression    api    products
    ${response}=    ProductsApi.Delete Product    ${ADMIN_TOKEN}    000000000000000000000001
    Validation.Validate Response    ${response}    404

Delete Product — Product assigned to order returns 400
    [Tags]    regression    api    products
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}    1
    VAR    ${product_id}=    ${order_resp.body["Order"]["products"][0]["_id"]}
    ${response}=    ProductsApi.Delete Product    ${ADMIN_TOKEN}    ${product_id}
    Validation.Validate Response    ${response}    400


*** Keywords ***
Setup Admin Token
    ${token}=    Get Admin Token
    Set Suite Variable    ${ADMIN_TOKEN}    ${token}
