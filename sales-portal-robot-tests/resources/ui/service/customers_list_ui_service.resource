*** Settings ***
Documentation       Customers list UI service keywords — search and navigation flows via the customers list page.

Resource            resources/ui/pages/customers/customers_list_page.resource
Resource            resources/ui/pages/customers/customer_details_page.resource


*** Keywords ***
Filter Customers Via UI
    [Documentation]    Navigates to the customers list and filters by the given search term.
    [Arguments]    ${search_term}
    Open Customers List Page
    Wait For Customers Table
    Search Customers    ${search_term}

Open Customer Details Via UI
    [Documentation]    Navigates to the customers list and opens the details page for the given email.
    [Arguments]    ${customer_email}
    Open Customers List Page
    Wait For Customers Table
    Click Customer Details    ${customer_email}
    Wait For Customer Details Page
