*** Settings ***
Documentation       Products list page keywords.

Resource            ../sales_portal_page.resource


*** Variables ***
${PRODUCTS_TABLE}               css=[data-name="table-products"]
${ADD_PRODUCT_BTN}              css=[name="add-button"]
${SEARCH_INPUT}                 css=\#search
${SEARCH_SUBMIT_BTN}            css=\#search-products
${PRODUCTS_TABLE_BODY}          css=\#table-products tbody


*** Keywords ***
Open Products List Page
    [Documentation]    Navigates to the products list page.
    Open Sales Portal Page    \#/products

Click Add New Product Button
    [Documentation]    Clicks the Add Product button on the products list page.
    Click    ${ADD_PRODUCT_BTN}
    Wait For Spinner To Disappear

Search Products
    [Documentation]    Types a search term and submits the search.
    [Arguments]    ${search_term}
    Fill Text    ${SEARCH_INPUT}    ${search_term}
    Click    ${SEARCH_SUBMIT_BTN}
    Wait For Spinner To Disappear

Get Product Table Row
    [Documentation]    Returns a CSS selector for a table row matching the given product name.
    [Arguments]    ${product_name}
    RETURN    css=#table-products tbody tr:has(td:text-is("${product_name}"))

Click Delete Product
    [Documentation]    Clicks the Delete button for a product row identified by name.
    [Arguments]    ${product_name}
    Click    css=#table-products tbody tr:has(td:text-is("${product_name}")) button[title="Delete"]

Click Edit Product
    [Documentation]    Clicks the Edit button for a product row identified by name.
    [Arguments]    ${product_name}
    Click    css=#table-products tbody tr:has(td:text-is("${product_name}")) a[title="Edit"]
    Wait For Spinner To Disappear

Click Product Details
    [Documentation]    Clicks the Details button for a product row identified by name.
    [Arguments]    ${product_name}
    Click    css=#table-products tbody tr:has(td:text-is("${product_name}")) button[title="Details"]

Wait For Products Table
    [Documentation]    Waits for the products table to be visible.
    Wait For Elements State    ${PRODUCTS_TABLE}    visible    timeout=${DEFAULT_TIMEOUT}
