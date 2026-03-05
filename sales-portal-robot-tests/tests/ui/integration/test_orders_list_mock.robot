*** Settings ***
Documentation       Integration tests — Orders List page with mocked API responses.
Metadata            Suite        UI
Metadata            Sub-Suite    Integration

Library             Browser
Library             libraries/mock/mock_library.py                AS    Mock
Library             libraries/utils/data_generator_library.py    AS    DataGen

Resource            resources/ui/ui_suite_setup.resource
Resource            resources/ui/pages/orders/orders_list_page.resource
Resource            resources/ui/pages/sales_portal_page.resource

Suite Setup         Setup UI Browser Context
Suite Teardown      Teardown UI Browser Context
Test Setup          Reset Page And Clear Mocks
Test Tags           integration    ui    orders    regression


*** Test Cases ***
Orders List — Renders rows from mocked response
    [Documentation]    Mock 5 orders and assert the table renders exactly 5 rows.
    ${mock_orders}=    DataGen.Build Mock Orders List    5
    Mock.Mock Get All Orders    ${mock_orders}
    Open Orders List Page
    Wait For Orders Table
    ${rows}=    Get Element Count    css=#table-orders tbody tr
    Should Be Equal As Integers    ${rows}    5

Orders List — Shows no records for empty mocked response
    [Documentation]    Mock empty orders list and assert the 'No records' row appears.
    Mock.Mock Get All Orders    ${{[]}}
    Open Orders List Page
    Wait For Orders Table
    ${rows}=    Get Element Count    css=#table-orders tbody tr
    Should Be Equal As Integers    ${rows}    1
    Get Text    css=#table-orders tbody tr:first-child    contains    No records


*** Keywords ***
Reset Page And Clear Mocks
    [Documentation]    Navigates to a blank page and clears all route mocks so the next
    ...    navigation triggers a fresh SPA load and API call.
    Mock.Clear All Mocks
    Go To    about:blank
