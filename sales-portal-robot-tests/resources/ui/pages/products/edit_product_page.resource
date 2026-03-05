*** Settings ***
Documentation       Edit Product page keywords.

Resource            ../sales_portal_page.resource


*** Variables ***
${EDIT_PRODUCT_FORM}        css=\#edit-product-form
${INPUT_NAME}               css=\#inputName
${INPUT_MANUFACTURER}       css=\#inputManufacturer
${INPUT_PRICE}              css=\#inputPrice
${INPUT_AMOUNT}             css=\#inputAmount
${TEXTAREA_NOTES}           css=\#textareaNotes
${SAVE_CHANGES_BTN}         css=\#save-product-changes
${DELETE_PRODUCT_BTN}       css=\#delete-product-btn


*** Keywords ***
Open Edit Product Page
    [Documentation]    Navigates directly to the edit page for the given product ID.
    [Arguments]    ${product_id}
    Open Sales Portal Page    \#/products/${product_id}/edit

Update Product Field
    [Documentation]    Clears and fills a specific product field by its locator.
    [Arguments]    ${field_locator}    ${new_value}
    Clear Text    ${field_locator}
    Fill Text    ${field_locator}    ${new_value}

Submit Edit Form
    [Documentation]    Clicks Save Changes and waits for spinner to clear.
    Click    ${SAVE_CHANGES_BTN}
    Wait For Spinner To Disappear

Click Delete From Edit Page
    [Documentation]    Clicks the Delete Product button on the edit page (opens confirmation modal).
    Click    ${DELETE_PRODUCT_BTN}
