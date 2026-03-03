*** Settings ***
Documentation    API tests — POST /api/login
Metadata         Suite        API
Metadata         Sub-Suite    Login

Library    libraries/api/api_client.py                       WITH NAME    ApiClient
Library    libraries/api/endpoints/login_api_library.py      WITH NAME    LoginApi
Library    libraries/utils/validation_library.py             WITH NAME    Validation

Variables    variables/env.py
Variables    data/schemas/login/login_schema.py


*** Test Cases ***
Login — Valid credentials returns 200 and token
    [Tags]    smoke    regression    api    login
    ${response}=    LoginApi.Login User    ${USER_NAME}    ${USER_PASSWORD}
    Validation.Validate Response    ${response}    200    ${LOGIN_SCHEMA}
    Should Not Be Empty    ${response.headers["Authorization"]}

Login — Invalid password returns 400
    [Tags]    regression    api    login
    ${response}=    LoginApi.Login User    ${USER_NAME}    wrong_password
    Validation.Validate Response    ${response}    400

Login — Non-existent user returns 400
    [Tags]    regression    api    login
    ${response}=    LoginApi.Login User    nonexistent@example.com    any_password
    Validation.Validate Response    ${response}    400
