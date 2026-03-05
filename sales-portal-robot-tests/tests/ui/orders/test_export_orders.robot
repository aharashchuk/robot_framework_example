*** Settings ***
Documentation       UI tests — Export orders to file
Metadata            Suite        UI
Metadata            Sub-Suite    Orders

Library             Browser
Library             libraries/stores/entity_store_library.py    AS    EntityStore

Resource            resources/ui/ui_suite_setup.resource
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/orders_service.resource
Resource            resources/ui/pages/orders/orders_list_page.resource

Suite Setup         Setup UI Suite
Suite Teardown      Teardown UI Browser Context
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}
Test Tags           regression    ui    orders


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Export Orders — CSV File Downloads Successfully
    [Documentation]    Creates orders, opens export modal, selects CSV and downloads file.
    Create Order And Track    ${ADMIN_TOKEN}

    Open Orders List Page
    Wait For Orders Table
    Open Export Modal
    ${download}=    Download Export File
    Should Not Be Empty    ${download}

Export Orders — JSON File Downloads Successfully
    [Documentation]    Creates orders, opens export modal, selects JSON and downloads file.
    Create Order And Track    ${ADMIN_TOKEN}

    Open Orders List Page
    Wait For Orders Table
    Open Export Modal
    Click    css=\#exportJson
    ${download}=    Download Export File
    Should Not Be Empty    ${download}


*** Keywords ***
Setup UI Suite
    [Documentation]    Gets admin token and sets up browser context with auth state.
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE    # robocop: off=VAR05
    Setup UI Browser Context
