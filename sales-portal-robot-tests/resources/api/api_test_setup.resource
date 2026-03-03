*** Settings ***
Documentation    Shared library and resource imports for all API test suites.

Library    libraries/api/api_client.py                  WITH NAME    ApiClient
Library    libraries/utils/validation_library.py        WITH NAME    Validation
Library    libraries/stores/entity_store_library.py     WITH NAME    EntityStore

Resource   resources/api/service/login_service.resource
