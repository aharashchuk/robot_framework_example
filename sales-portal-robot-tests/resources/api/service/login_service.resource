*** Settings ***
Documentation       Login API service keywords — high-level login flows.

Library             libraries/api/api_client.py    AS    ApiClient
Library             libraries/api/endpoints/login_api_library.py    AS    LoginApi
Variables           variables/env.py


*** Keywords ***
Get Admin Token
    [Documentation]    Authenticates with admin credentials and returns the Bearer token.
    ${response}=    LoginApi.Login User    username=${USER_NAME}    password=${USER_PASSWORD}
    Should Be Equal As Integers    ${response.status}    200
    VAR    ${token}=    ${response.headers["Authorization"]}
    RETURN    ${token}
