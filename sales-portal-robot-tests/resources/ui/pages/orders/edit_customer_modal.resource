*** Settings ***
Documentation       Edit Order Customer modal keywords.

Resource            ../base_modal.resource


*** Variables ***
${EDIT_CUSTOMER_MODAL}          css=\#edit-customer-modal
${EDIT_CUSTOMER_SELECT}         css=\#inputCustomerOrder
${SAVE_CUSTOMER_BTN}            css=\#update-customer-btn
${CANCEL_EDIT_CUSTOMER_BTN}     css=\#cancel-edit-customer-modal-btn


*** Keywords ***
Wait For Edit Customer Modal
    [Documentation]    Waits for the edit customer modal to be visible.
    Wait For Elements State    ${EDIT_CUSTOMER_MODAL}    visible    timeout=${DEFAULT_TIMEOUT}

Select Customer In Edit Modal
    [Documentation]    Selects a customer by name in the edit customer dropdown.
    [Arguments]    ${customer_name}
    Select Options By    ${EDIT_CUSTOMER_SELECT}    text    ${customer_name}

Save Edit Customer Modal
    [Documentation]    Clicks the Save button and waits for the modal to close.
    Click    ${SAVE_CUSTOMER_BTN}
    Wait For Elements State    ${EDIT_CUSTOMER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Spinner To Disappear

Cancel Edit Customer Modal
    [Documentation]    Clicks the Cancel button to close the edit customer modal.
    Click    ${CANCEL_EDIT_CUSTOMER_BTN}
    Wait For Elements State    ${EDIT_CUSTOMER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}

Click Edit Customer Pencil
    [Documentation]    Clicks the edit pencil on the customer section to open the edit customer modal.
    Click    css=\#edit-customer-pencil
    Wait For Spinner To Disappear
