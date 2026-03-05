*** Settings ***
Documentation       API tests — POST /api/login
Metadata            Suite    API
Metadata            Sub-Suite    Login

Library             libraries/api/api_client.py    AS    ApiClient
Library             libraries/api/endpoints/login_api_library.py    AS    LoginApi
Library             libraries/utils/validation_library.py    AS    Validation
Variables           variables/env.py
Variables           data/schemas/login/login_schema.py

Test Tags           api    login    regression


*** Test Cases ***
Login — Valid credentials returns 200 and token
    [Tags]    smoke
    ${response}=    LoginApi.Login User    ${USER_NAME}    ${USER_PASSWORD}
    Validation.Validate Response    ${response}    200    ${LOGIN_SCHEMA}
    Should Not Be Empty    ${response.headers["Authorization"]}

Login — Invalid password returns 400
    ${response}=    LoginApi.Login User    ${USER_NAME}    wrong_password
    Validation.Validate Response    ${response}    400

Login — Non-existent user returns 400
    ${response}=    LoginApi.Login User    nonexistent@example.com    any_password
    Validation.Validate Response    ${response}    400
