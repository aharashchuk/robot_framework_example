*** Settings ***
Documentation       Customer Details page keywords.

Resource            ../sales_portal_page.resource


*** Variables ***
${CUSTOMER_INFO_CONTAINER}      css=\#customer-info-container
${CUSTOMER_EMAIL}               css=\#customer-email
${CUSTOMER_NAME}                css=\#customer-name
${CUSTOMER_PHONE}               css=\#customer-phone
${CUSTOMER_COUNTRY}             css=\#customer-country
${CUSTOMER_CITY}                css=\#customer-city
${CUSTOMER_STREET}              css=\#customer-street
${CUSTOMER_HOUSE}               css=\#customer-house
${CUSTOMER_FLAT}                css=\#customer-flat
${CUSTOMER_NOTES}               css=\#customer-notes
${CUSTOMER_ORDERS_TABLE}        css=\#table-orders


*** Keywords ***
Wait For Customer Details Page
    [Documentation]    Waits for the customer info container to be visible.
    Wait For Elements State    ${CUSTOMER_INFO_CONTAINER}    visible    timeout=${DEFAULT_TIMEOUT}

Verify Customer Details
    [Documentation]    Verifies that customer detail fields show the expected values.
    [Arguments]    ${email}    ${name}    ${phone}
    Get Text    ${CUSTOMER_EMAIL}    ==    ${email}
    Get Text    ${CUSTOMER_NAME}    ==    ${name}
    Get Text    ${CUSTOMER_PHONE}    ==    ${phone}

Verify Customer Address
    [Documentation]    Verifies that the customer address fields show the expected values.
    [Arguments]    ${country}    ${city}    ${street}    ${house}    ${flat}
    Get Text    ${CUSTOMER_COUNTRY}    ==    ${country}
    Get Text    ${CUSTOMER_CITY}    ==    ${city}
    Get Text    ${CUSTOMER_STREET}    ==    ${street}
    Get Text    ${CUSTOMER_HOUSE}    ==    ${house}
    Get Text    ${CUSTOMER_FLAT}    ==    ${flat}

Click Edit Customer From Details Page
    [Documentation]    Clicks the edit pencil button on the customer details page.
    Click    css=#edit-customer-pencil
    Wait For Spinner To Disappear
