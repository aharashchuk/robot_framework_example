*** Settings ***
Documentation       Create Order modal keywords.

Resource            ../base_modal.resource


*** Variables ***
${CREATE_ORDER_MODAL}           css=\#add-order-modal
${CUSTOMER_SELECT}              css=\#inputCustomerOrder
${PRODUCTS_SECTION}             css=\#products-section
${ADD_PRODUCT_BTN}              css=\#add-product-btn
${CREATE_ORDER_BTN}             css=\#create-order-btn
${CANCEL_ORDER_MODAL_BTN}       css=\#cancel-order-modal-btn
${TOTAL_PRICE_LABEL}            css=\#total-price-order-modal


*** Keywords ***
Wait For Create Order Modal
    [Documentation]    Waits for the create order modal to be visible.
    Wait For Elements State    ${CREATE_ORDER_MODAL}    visible    timeout=${DEFAULT_TIMEOUT}

Select Customer In Modal
    [Documentation]    Selects a customer by name in the customer dropdown.
    [Arguments]    ${customer_name}
    Select Options By    ${CUSTOMER_SELECT}    text    ${customer_name}

Select Product In Modal
    [Documentation]    Selects a product in the Nth product row (1-based index, default 1).
    [Arguments]    ${product_name}    ${row_index}=1
    VAR    ${selector}    css=#products-section select[name="Product"]:nth-of-type(${row_index})
    Select Options By    ${selector}    text    ${product_name}

Add Product To Order
    [Documentation]    Clicks Add Product to append a new product row, then selects the product.
    [Arguments]    ${product_name}
    Click    ${ADD_PRODUCT_BTN}
    ${count}=    Get Element Count    css=#products-section select[name="Product"]
    VAR    ${selector}    css=#products-section div[data-id]:nth-of-type(${count}) select[name="Product"]
    Select Options By    ${selector}    text    ${product_name}

Submit Create Order Form
    [Documentation]    Clicks the Create button and waits for the modal to close.
    Click    ${CREATE_ORDER_BTN}
    Wait For Elements State    ${CREATE_ORDER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Spinner To Disappear

Cancel Create Order Modal
    [Documentation]    Clicks the Cancel button to close the create order modal.
    Click    ${CANCEL_ORDER_MODAL_BTN}
    Wait For Elements State    ${CREATE_ORDER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
