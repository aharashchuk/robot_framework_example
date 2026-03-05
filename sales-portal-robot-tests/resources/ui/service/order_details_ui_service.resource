*** Settings ***
Documentation       Order Details UI service keywords — delivery and status change flows via the UI.

Resource            resources/ui/pages/orders/order_details_page.resource
Resource            resources/ui/pages/base_modal.resource


*** Keywords ***
Fill Order Delivery Via UI
    [Documentation]    Opens the delivery form for the given order, fills all delivery fields and saves.
    ...    ${delivery_data} dict keys: condition (Delivery/Pickup), finalDate (MM/DD/YYYY), and
    ...    nested address keys: country, city, street, house, flat.
    [Arguments]    ${order_id}    ${delivery_data}
    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Click Add Delivery Button
    Wait For Elements State    css=#schedule-delivery    visible    timeout=${DEFAULT_TIMEOUT}
    Fill Delivery Form    ${delivery_data}
    Click    css=#save-delivery
    Wait For Spinner To Disappear

Fill Delivery Form
    [Documentation]    Selects the delivery condition, date, and address fields on the delivery page.
    [Arguments]    ${delivery_data}
    Select Options By    css=#inputType    text    ${delivery_data}[condition]
    Evaluate JavaScript
    ...    ${None}
    ...    (date) => {
    ...    setUpDateToDatePicker(date);
    ...    document.getElementById('schedule-delivery').dispatchEvent(new Event('change', {bubbles: true}));
    ...    }
    ...    arg=${delivery_data}[finalDate]
    VAR    ${address}    ${delivery_data}[address]
    IF    "${delivery_data}[condition]" == "Delivery"
        Select Options By    css=#inputLocation    text    Other
        Wait For Elements State    css=#inputCity    editable    timeout=${DEFAULT_TIMEOUT}
        Fill Text    css=#inputCity    ${address}[city]
        Fill Text    css=#inputStreet    ${address}[street]
        Fill Text    css=#inputHouse    ${address}[house]
        Fill Text    css=#inputFlat    ${address}[flat]
    END

Change Order Status Via UI
    [Documentation]    Opens the order details page and clicks the status action button
    ...    (Cancel Order or Process Order), then confirms the action in the modal.
    [Arguments]    ${order_id}    ${action}
    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    IF    "${action}" == "Cancel"
        Click Cancel Order
    ELSE IF    "${action}" == "Process"
        Click Process Order
    END
    Confirm Action In Modal
