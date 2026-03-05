*** Settings ***
Documentation       Shared library and resource imports for all API test suites.

Library             libraries/api/api_client.py    AS    ApiClient
Library             libraries/utils/validation_library.py    AS    Validation
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Resource            resources/api/service/login_service.resource
