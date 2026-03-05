*** Settings ***
Documentation       Orders list page keywords.

Resource            ../sales_portal_page.resource


*** Variables ***
${ORDERS_TABLE}                 css=[data-name="table-orders"]
${ADD_ORDER_BTN}                 css=[name="add-button"]
${SEARCH_INPUT}                 css=\#search
${SEARCH_SUBMIT_BTN}            css=\#search-orders
${EXPORT_BTN}                   css=\#export
${EXPORT_MODAL}                 css=\#exportModal
${EXPORT_DOWNLOAD_BTN}          css=\#export-button


*** Keywords ***
Open Orders List Page
    [Documentation]    Navigates to the orders list page and waits for the spinner to disappear.
    Open Sales Portal Page    \#/orders
    Wait For Spinner To Disappear

Click Create Order Button
    [Documentation]    Clicks the Create Order button; uses force to skip post-click actionability re-check.
    ...    The button click triggers an async operation that immediately creates a modal backdrop,
    ...    which would otherwise cause Playwright to retry the click indefinitely.
    Click With Options    ${ADD_ORDER_BTN}    force=${True}

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

Open Export Modal
    [Documentation]    Clicks the export trigger and waits for the export modal to appear.
    Click    ${EXPORT_BTN}
    Wait For Elements State    ${EXPORT_MODAL}    visible    timeout=${DEFAULT_TIMEOUT}

Download Export File
    [Documentation]    Clicks the Download button in the export modal and waits for the download to complete.
    ${promise}=    Promise To Wait For Download
    Click    ${EXPORT_DOWNLOAD_BTN}
    ${download}=    Wait For    ${promise}
    RETURN    ${download}
