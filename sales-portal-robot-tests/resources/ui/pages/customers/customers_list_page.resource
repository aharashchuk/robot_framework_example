*** Settings ***
Documentation       Customers list page keywords.

Resource            ../sales_portal_page.resource


*** Variables ***
${CUSTOMERS_TABLE}              css=[data-name="table-customers"]
${ADD_CUSTOMER_BTN}             css=[name="add-button"]
${SEARCH_INPUT}                 css=\#search
${SEARCH_SUBMIT_BTN}            css=\#search-customer


*** Keywords ***
Open Customers List Page
    [Documentation]    Navigates to the customers list page.
    Open Sales Portal Page    \#/customers

Click Add New Customer Button
    [Documentation]    Clicks the Add Customer button on the customers list page.
    Click    ${ADD_CUSTOMER_BTN}
    Wait For Spinner To Disappear

Search Customers
    [Documentation]    Types a search term and submits the search.
    [Arguments]    ${search_term}
    Fill Text    ${SEARCH_INPUT}    ${search_term}
    Click    ${SEARCH_SUBMIT_BTN}
    Wait For Spinner To Disappear

Get Customer Table Row
    [Documentation]    Returns a CSS selector for a table row matching the given customer email.
    [Arguments]    ${customer_email}
    RETURN    css=#table-customers tbody tr:has(td:text-is("${customer_email}"))

Click Delete Customer
    [Documentation]    Clicks the Delete button for a customer row identified by email.
    [Arguments]    ${customer_email}
    Click    css=#table-customers tbody tr:has(td:text-is("${customer_email}")) button[title="Delete"]

Click Edit Customer
    [Documentation]    Clicks the Edit button for a customer row identified by email.
    [Arguments]    ${customer_email}
    Click    css=#table-customers tbody tr:has(td:text-is("${customer_email}")) a[title="Edit"]
    Wait For Spinner To Disappear

Click Customer Details
    [Documentation]    Clicks the Details button for a customer row identified by email.
    [Arguments]    ${customer_email}
    Click    css=#table-customers tbody tr:has(td:text-is("${customer_email}")) a[title="Details"]
    Wait For Spinner To Disappear

Wait For Customers Table
    [Documentation]    Waits for the customers table to be visible.
    Wait For Elements State    ${CUSTOMERS_TABLE}    visible    timeout=${DEFAULT_TIMEOUT}
