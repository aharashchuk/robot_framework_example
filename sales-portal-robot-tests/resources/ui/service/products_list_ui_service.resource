*** Settings ***
Documentation       Products list UI service keywords — search and export flows via the products list page.

Resource            resources/ui/pages/products/products_list_page.resource


*** Keywords ***
Filter Products Via UI
    [Documentation]    Navigates to the products list and filters by the given search term.
    [Arguments]    ${search_term}
    Open Products List Page
    Wait For Products Table
    Search Products    ${search_term}

Export And Download CSV
    [Documentation]    Opens the export modal on the products list page and downloads all data as CSV.
    Open Products List Page
    Wait For Products Table
    Click    css=#export
    Wait For Elements State    css=#exportModal    visible    timeout=${DEFAULT_TIMEOUT}
    Click    css=#export-button
    Wait For Elements State    css=#exportModal    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Toast Message
