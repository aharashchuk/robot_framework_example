*** Settings ***
Documentation       Add New Product UI service keywords — end-to-end product creation via the UI.

Library             libraries/utils/data_generator_library.py    AS    DataGen
Resource            resources/ui/pages/products/products_list_page.resource
Resource            resources/ui/pages/products/add_new_product_page.resource


*** Keywords ***
Add New Product Via UI
    [Documentation]    Navigates to products list, opens the Add Product form, fills and submits it.
    ...    Returns the product name from the submitted form data.
    [Arguments]    ${product_data}
    Open Products List Page
    Click Add New Product Button
    Fill Product Form
    ...    ${product_data}[name]
    ...    ${product_data}[amount]
    ...    ${product_data}[price]
    ...    ${product_data}[manufacturer]
    ...    ${product_data.get('notes', '')}
    Submit Product Form
    Wait For Toast Message
    RETURN    ${product_data}[name]

Add New Product With Defaults Via UI
    [Documentation]    Generates random product data, creates the product via UI and returns its name.
    ${data}=    DataGen.Generate Product Data
    ${name}=    Add New Product Via UI    ${data}
    RETURN    ${name}
