*** Settings ***
Documentation       Products API service keywords — high-level product flows with validation and tracking.

Library             Collections
Library             libraries/api/api_client.py    AS    ApiClient
Library             libraries/api/endpoints/products_api_library.py    AS    ProductsApi
Library             libraries/utils/validation_library.py    AS    Validation
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Library             libraries/utils/data_generator_library.py    AS    DataGen


*** Keywords ***
Create Product And Track
    [Documentation]    Creates a product with random data, validates 201, tracks ID for cleanup.
    [Arguments]    ${token}
    ${data}=    DataGen.Generate Product Data
    ${response}=    ProductsApi.Create Product    ${token}    ${data}
    Validation.Validate Response    ${response}    201
    VAR    ${product_id}=    ${response.body["Product"]["_id"]}
    EntityStore.Track Product    ${product_id}
    RETURN    ${response}

Create Product With Data And Track
    [Documentation]    Creates a product with explicit data dict, validates 201, tracks ID for cleanup.
    [Arguments]    ${token}    ${data}
    ${response}=    ProductsApi.Create Product    ${token}    ${data}
    Validation.Validate Response    ${response}    201
    VAR    ${product_id}=    ${response.body["Product"]["_id"]}
    EntityStore.Track Product    ${product_id}
    RETURN    ${response}

Delete Product By Id
    [Documentation]    Deletes a product by ID and validates 200.
    [Arguments]    ${token}    ${product_id}
    ${response}=    ProductsApi.Delete Product    ${token}    ${product_id}
    Validation.Validate Response    ${response}    200
    RETURN    ${response}

Bulk Create Products
    [Documentation]    Creates N products with random data and returns list of product dicts.
    [Arguments]    ${token}    ${count}
    VAR    @{products}=    @{EMPTY}
    FOR    ${_}    IN RANGE    ${count}
        ${response}=    Create Product And Track    ${token}
        Append To List    ${products}    ${response.body["Product"]}
    END
    RETURN    ${products}
