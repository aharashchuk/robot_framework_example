*** Settings ***
Documentation       Add New Customer page keywords.

Resource            ../sales_portal_page.resource


*** Variables ***
${ADD_CUSTOMER_FORM}        css=\#add-new-customer-form
${INPUT_EMAIL}              css=\#inputEmail
${INPUT_NAME}               css=\#inputName
${INPUT_COUNTRY}            css=\#inputCountry
${INPUT_CITY}               css=\#inputCity
${INPUT_STREET}             css=\#inputStreet
${INPUT_HOUSE}              css=\#inputHouse
${INPUT_FLAT}               css=\#inputFlat
${INPUT_PHONE}              css=\#inputPhone
${TEXTAREA_NOTES}           css=\#textareaNotes
${SAVE_NEW_CUSTOMER_BTN}    css=\#save-new-customer
${CLEAR_INPUTS_BTN}         css=\#clear-inputs


*** Keywords ***
Fill Customer Form
    [Documentation]    Fills all customer form fields from a dict with keys:
    ...    email, name, country, city, street, house, flat, phone, notes (optional).
    [Arguments]    ${customer_data}
    Fill Text    ${INPUT_EMAIL}    ${customer_data}[email]
    Fill Text    ${INPUT_NAME}    ${customer_data}[name]
    Select Options By    ${INPUT_COUNTRY}    text    ${customer_data}[country]
    Fill Text    ${INPUT_CITY}    ${customer_data}[city]
    Fill Text    ${INPUT_STREET}    ${customer_data}[street]
    Fill Text    ${INPUT_HOUSE}    ${customer_data}[house]
    Fill Text    ${INPUT_FLAT}    ${customer_data}[flat]
    Fill Text    ${INPUT_PHONE}    ${customer_data}[phone]
    ${notes}=    Evaluate    $customer_data.get('notes', '')
    IF    "${notes}" != "${EMPTY}"    Fill Text    ${TEXTAREA_NOTES}    ${notes}

Submit Customer Form
    [Documentation]    Clicks the Save New Customer button and waits for navigation.
    Click    ${SAVE_NEW_CUSTOMER_BTN}
    Wait For Spinner To Disappear

Verify Customer Form Error
    [Documentation]    Verifies that an inline validation error is visible for the given field.
    [Arguments]    ${field_error_id}    ${expected_message}=${EMPTY}
    Wait For Elements State    css=#${field_error_id}    visible    timeout=${SHORT_TIMEOUT}
    IF    "${expected_message}" != "${EMPTY}"
        Get Text    css=#${field_error_id}    ==    ${expected_message}
    END

Clear Customer Form
    [Documentation]    Clicks Clear all to reset the form inputs.
    Click    ${CLEAR_INPUTS_BTN}
