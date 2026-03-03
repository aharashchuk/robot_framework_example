*** Settings ***
Documentation       Customers API service keywords — high-level customer flows with validation and tracking.

Library             libraries/api/api_client.py    AS    ApiClient
Library             libraries/api/endpoints/customers_api_library.py    AS    CustomersApi
Library             libraries/utils/validation_library.py    AS    Validation
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Library             libraries/utils/data_generator_library.py    AS    DataGen


*** Keywords ***
Create Customer And Track
    [Documentation]    Creates a customer with random data, validates 201, tracks ID for cleanup.
    [Arguments]    ${token}
    ${data}=    DataGen.Generate Customer Data
    ${response}=    CustomersApi.Create Customer    ${token}    ${data}
    Validation.Validate Response    ${response}    201
    VAR    ${customer_id}=    ${response.body["Customer"]["_id"]}
    EntityStore.Track Customer    ${customer_id}
    RETURN    ${response}

Create Customer With Data And Track
    [Documentation]    Creates a customer with explicit data dict, validates 201, tracks ID for cleanup.
    [Arguments]    ${token}    ${data}
    ${response}=    CustomersApi.Create Customer    ${token}    ${data}
    Validation.Validate Response    ${response}    201
    VAR    ${customer_id}=    ${response.body["Customer"]["_id"]}
    EntityStore.Track Customer    ${customer_id}
    RETURN    ${response}

Delete Customer By Id
    [Documentation]    Deletes a customer by ID and validates 200.
    [Arguments]    ${token}    ${customer_id}
    ${response}=    CustomersApi.Delete Customer    ${token}    ${customer_id}
    Validation.Validate Response    ${response}    200
    RETURN    ${response}
