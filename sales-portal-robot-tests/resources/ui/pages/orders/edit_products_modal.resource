*** Settings ***
Documentation       Edit Products modal keywords (used on the Order Details page).

Resource            ../base_modal.resource


*** Variables ***
${EDIT_PRODUCTS_MODAL}          css=\#edit-products-modal
${EDIT_PRODUCTS_SECTION}        css=\#edit-products-section
${ADD_PRODUCT_BTN}              css=\#add-product-btn
${UPDATE_PRODUCTS_BTN}          css=\#update-products-btn
${CANCEL_EDIT_PRODUCTS_BTN}     css=\#cancel-edit-products-modal-btn


*** Keywords ***
Wait For Edit Products Modal
    [Documentation]    Waits for the edit products modal to be visible.
    Wait For Elements State    ${EDIT_PRODUCTS_MODAL}    visible    timeout=${DEFAULT_TIMEOUT}

Select Product In Edit Modal
    [Documentation]    Selects a product by name in the Nth product row (1-based).
    [Arguments]    ${product_name}    ${row_index}=1
    VAR    ${selector}
    ...    css=#edit-products-section div[data-id]:nth-of-type(${row_index}) select[name="Product"]
    Select Options By    ${selector}    text    ${product_name}

Add Product To Existing Order
    [Documentation]    Clicks Add Product in the edit modal and selects the given product.
    [Arguments]    ${product_name}
    Click    ${ADD_PRODUCT_BTN}
    ${count}=    Get Element Count    css=#edit-products-section select[name="Product"]
    VAR    ${selector}
    ...    css=#edit-products-section div[data-id]:nth-of-type(${count}) select[name="Product"]
    Select Options By    ${selector}    text    ${product_name}

Remove Product From Order
    [Documentation]    Clicks the Delete button on the Nth product row in the edit modal.
    [Arguments]    ${row_index}=1
    Click    css=#edit-products-section div[data-id]:nth-of-type(${row_index}) button.del-btn-modal

Submit Edit Products Form
    [Documentation]    Clicks Save in the edit products modal and waits for it to close.
    Click    ${UPDATE_PRODUCTS_BTN}
    Wait For Elements State    ${EDIT_PRODUCTS_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Spinner To Disappear

Cancel Edit Products Modal
    [Documentation]    Clicks Cancel to close the edit products modal.
    Click    ${CANCEL_EDIT_PRODUCTS_BTN}
    Wait For Elements State    ${EDIT_PRODUCTS_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
