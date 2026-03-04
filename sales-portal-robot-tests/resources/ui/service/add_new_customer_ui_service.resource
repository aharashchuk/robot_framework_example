*** Settings ***
Documentation       Add New Customer UI service keywords — end-to-end customer creation via the UI.

Library             libraries/utils/data_generator_library.py    AS    DataGen
Resource            resources/ui/pages/customers/customers_list_page.resource
Resource            resources/ui/pages/customers/add_new_customer_page.resource


*** Keywords ***
Add New Customer Via UI
    [Documentation]    Navigates to customers list, opens the Add Customer form, fills and submits it.
    ...    Returns the customer email from the submitted form data.
    [Arguments]    ${customer_data}
    Open Customers List Page
    Click Add New Customer Button
    Fill Customer Form    ${customer_data}
    Submit Customer Form
    Wait For Toast Message
    RETURN    ${customer_data}[email]

Add New Customer With Defaults Via UI
    [Documentation]    Generates random customer data, creates the customer via UI and returns its email.
    ${data}=    DataGen.Generate Customer Data
    ${email}=    Add New Customer Via UI    ${data}
    RETURN    ${email}
