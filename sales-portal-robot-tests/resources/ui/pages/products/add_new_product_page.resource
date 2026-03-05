*** Settings ***
Documentation       Add New Product page keywords.

Resource            ../sales_portal_page.resource


*** Variables ***
${ADD_PRODUCT_FORM}         css=\#add-new-product-form
${INPUT_NAME}               css=\#inputName
${INPUT_MANUFACTURER}       css=\#inputManufacturer
${INPUT_PRICE}              css=\#inputPrice
${INPUT_AMOUNT}             css=\#inputAmount
${TEXTAREA_NOTES}           css=\#textareaNotes
${SAVE_NEW_PRODUCT_BTN}     css=\#save-new-product
${CLEAR_INPUTS_BTN}         css=\#clear-inputs


*** Keywords ***
Fill Product Form
    [Documentation]    Fills the product form fields. Notes is optional.
    [Arguments]    ${name}    ${amount}    ${price}    ${manufacturer}    ${notes}=${EMPTY}
    Fill Text    ${INPUT_NAME}    ${name}
    Fill Text    ${INPUT_AMOUNT}    ${amount}
    Fill Text    ${INPUT_PRICE}    ${price}
    Select Options By    ${INPUT_MANUFACTURER}    text    ${manufacturer}
    IF    "${notes}" != "${EMPTY}"    Fill Text    ${TEXTAREA_NOTES}    ${notes}

Submit Product Form
    [Documentation]    Clicks the Save New Product button and waits for navigation.
    Click    ${SAVE_NEW_PRODUCT_BTN}
    Wait For Spinner To Disappear

Verify Product Form Error
    [Documentation]    Verifies that an inline validation error is visible for the given field.
    [Arguments]    ${field_error_id}    ${expected_message}=${EMPTY}
    Wait For Elements State    css=#${field_error_id}    visible    timeout=${SHORT_TIMEOUT}
    IF    "${expected_message}" != "${EMPTY}"
        Get Text    css=#${field_error_id}    ==    ${expected_message}
    END

Clear Product Form
    [Documentation]    Clicks Clear all to reset the form inputs.
    Click    ${CLEAR_INPUTS_BTN}
