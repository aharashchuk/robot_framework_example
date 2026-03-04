*** Settings ***
Documentation       Orders list page keywords.

Resource            ../sales_portal_page.resource


*** Variables ***
${ORDERS_TABLE}                 css=[data-name="table-orders"]
${CREATE_ORDER_BTN}             css=[name="add-button"]
${SEARCH_INPUT}                 css=\#search
${SEARCH_SUBMIT_BTN}            css=\#search-orders


*** Keywords ***
Open Orders List Page
    [Documentation]    Navigates to the orders list page.
    Open Sales Portal Page    \#/orders

Click Create Order Button
    [Documentation]    Clicks the Create Order button on the orders list page.
    Click    ${CREATE_ORDER_BTN}

Get Order Table Row
    [Documentation]    Returns a CSS selector for the table row matching the given order ID.
    [Arguments]    ${order_id}
    RETURN    css=#table-orders tbody tr:has(td:text-is("${order_id}"))

Click Order Row
    [Documentation]    Clicks the Details link for the given order ID to navigate to order details.
    [Arguments]    ${order_id}
    Click    css=#table-orders tbody tr:has(td:text-is("${order_id}")) a[title="Details"]
    Wait For Spinner To Disappear

Search Orders
    [Documentation]    Types a search term and submits the search.
    [Arguments]    ${search_term}
    Fill Text    ${SEARCH_INPUT}    ${search_term}
    Click    ${SEARCH_SUBMIT_BTN}
    Wait For Spinner To Disappear

Wait For Orders Table
    [Documentation]    Waits for the orders table to be visible.
    Wait For Elements State    ${ORDERS_TABLE}    visible    timeout=${DEFAULT_TIMEOUT}
