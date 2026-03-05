*** Settings ***
Documentation       Product Details modal keywords.

Resource            ../base_modal.resource


*** Variables ***
${PRODUCT_DETAILS_MODAL}    css=\#ProductDetailsModal
${DETAILS_MODAL_BODY}       css=\#details-modal-body-container
${DETAILS_EDIT_BTN}         css=\#ProductDetailsModal .modal-footer a.btn-primary
${DETAILS_CLOSE_BTN}        css=\#ProductDetailsModal button.btn-close


*** Keywords ***
Open Product Details
    [Documentation]    Clicks the Details button for the given product name and waits for the modal.
    [Arguments]    ${product_name}
    Click    css=#table-products tbody tr:has(td:text-is("${product_name}")) button[title="Details"]
    Wait For Elements State    ${PRODUCT_DETAILS_MODAL}    visible    timeout=${DEFAULT_TIMEOUT}

Verify Product Details
    [Documentation]    Verifies that a given field label and value are visible in the details modal.
    [Arguments]    ${field_label}    ${expected_value}
    Get Text    ${DETAILS_MODAL_BODY}    contains    ${field_label}
    Get Text    ${DETAILS_MODAL_BODY}    contains    ${expected_value}

Close Product Details Modal
    [Documentation]    Closes the product details modal.
    Click    ${DETAILS_CLOSE_BTN}
    Wait For Elements State    ${PRODUCT_DETAILS_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}

Click Edit From Details Modal
    [Documentation]    Clicks the Edit Product button inside the details modal.
    Click    ${DETAILS_EDIT_BTN}
    Wait For Spinner To Disappear
