*** Settings ***
Documentation       Order Details page keywords.

Resource            ../sales_portal_page.resource


*** Variables ***
${ORDER_STATUS_BAR}         css=\#order-status-bar-container
${ORDER_DETAILS_HEADER}     css=\#order-details-header
${CANCEL_ORDER_BTN}         css=\#cancel-order
${PROCESS_ORDER_BTN}        css=\#process-order
${REOPEN_ORDER_BTN}         css=\#reopen-order
${REFRESH_ORDER_BTN}        css=\#refresh-order
${EDIT_CUSTOMER_PENCIL}     css=\#edit-customer-pencil
${EDIT_PRODUCTS_PENCIL}     css=\#edit-products-pencil
${CUSTOMER_SECTION}         css=\#customer-section
${PRODUCTS_SECTION}         css=\#products-section
${DELIVERY_TAB}             css=\#delivery-tab
${HISTORY_TAB}              css=\#history-tab
${COMMENTS_TAB}             css=\#comments-tab
${DELIVERY_BTN}             css=\#delivery-btn
${COMMENTS_TEXTAREA}        css=\#textareaComments
${CREATE_COMMENT_BTN}       css=\#create-comment-btn


*** Keywords ***
Open Order Details Page
    [Documentation]    Navigates directly to the order details page for the given order ID.
    [Arguments]    ${order_id}
    Open Sales Portal Page    \#/orders/${order_id}

Wait For Order Details Page
    [Documentation]    Waits for the order status bar to be visible.
    Wait For Elements State    ${ORDER_STATUS_BAR}    visible    timeout=${DEFAULT_TIMEOUT}

Verify Order Status
    [Documentation]    Verifies the order status text in the status bar.
    [Arguments]    ${expected_status}
    Get Text    ${ORDER_STATUS_BAR}    contains    ${expected_status}

Verify Order Customer
    [Documentation]    Verifies customer details are visible in the customer section.
    [Arguments]    ${customer_name}
    Get Text    ${CUSTOMER_SECTION}    contains    ${customer_name}

Verify Order Products
    [Documentation]    Verifies that the given product name appears in the products section.
    [Arguments]    ${product_name}
    Get Text    ${PRODUCTS_SECTION}    contains    ${product_name}

Click Add Delivery Button
    [Documentation]    Clicks the Schedule/Edit Delivery button on the Delivery tab.
    Click    ${DELIVERY_TAB}
    Wait For Elements State    ${DELIVERY_BTN}    visible    timeout=${DEFAULT_TIMEOUT}
    Click    ${DELIVERY_BTN}
    Wait For Spinner To Disappear

Click Cancel Order
    [Documentation]    Clicks the Cancel Order button (opens confirmation modal).
    Click    ${CANCEL_ORDER_BTN}

Click Process Order
    [Documentation]    Clicks the Process Order button (opens confirmation modal).
    Click    ${PROCESS_ORDER_BTN}

Click Reopen Order
    [Documentation]    Clicks the Reopen Order button (opens confirmation modal).
    Click    ${REOPEN_ORDER_BTN}

Click Edit Products Pencil
    [Documentation]    Clicks the edit pencil on the products section to open the edit products modal.
    Click    ${EDIT_PRODUCTS_PENCIL}

Add Comment
    [Documentation]    Navigates to the Comments tab, fills the textarea and submits.
    [Arguments]    ${comment_text}
    Click    ${COMMENTS_TAB}
    Fill Text    ${COMMENTS_TEXTAREA}    ${comment_text}
    Click    ${CREATE_COMMENT_BTN}
    Wait For Spinner To Disappear
