*** Settings ***
Documentation       Edit Product UI service keywords — product update and verification flows via the UI.

Resource            resources/ui/pages/products/products_list_page.resource
Resource            resources/ui/pages/products/edit_product_page.resource
Resource            resources/ui/pages/sales_portal_page.resource


*** Keywords ***
Edit Product Via UI
    [Documentation]    Opens the edit page for the given product ID, applies field updates and saves.
    ...    ${updates} is a dict with any subset of: name, amount, price, manufacturer, notes.
    [Arguments]    ${product_id}    ${updates}
    Open Edit Product Page    ${product_id}
    ${name}=    Evaluate    $updates.get('name')
    IF    $name is not None    Update Product Field    css=#inputName    ${name}
    ${amount}=    Evaluate    $updates.get('amount')
    IF    $amount is not None    Update Product Field    css=#inputAmount    ${amount}
    ${price}=    Evaluate    $updates.get('price')
    IF    $price is not None    Update Product Field    css=#inputPrice    ${price}
    Submit Edit Form
    Wait For Toast Message

Verify Product Updated
    [Documentation]    Navigates to the products list, searches for the product and verifies its row exists.
    [Arguments]    ${product_name}
    Open Products List Page
    Search Products    ${product_name}
    Wait For Elements State
    ...    css=#table-products tbody tr:has(td:text-is("${product_name}"))
    ...    visible
    ...    timeout=${DEFAULT_TIMEOUT}
