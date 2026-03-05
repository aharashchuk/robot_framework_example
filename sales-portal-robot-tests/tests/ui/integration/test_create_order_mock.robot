*** Settings ***
Documentation       Integration tests — Create Order modal with mocked API responses.
Metadata            Suite    UI
Metadata            Sub-Suite    Integration

Library             Browser
Library             libraries/mock/mock_library.py    AS    Mock
Library             libraries/utils/data_generator_library.py    AS    DataGen
Resource            resources/ui/ui_suite_setup.resource
Resource            resources/ui/pages/orders/orders_list_page.resource
Resource            resources/ui/pages/orders/create_order_modal.resource
Resource            resources/ui/pages/sales_portal_page.resource

Suite Setup         Setup Integration Browser
Suite Teardown      Teardown Integration Browser
Test Setup          Setup Integration Test Context
Test Teardown       Run Keywords    Take Screenshot On Failure    AND    Teardown Integration Test Context

Test Tags           integration    ui    orders    regression


*** Variables ***
${MSG_NO_CUSTOMERS}         No customers found. Please add one before creating an order.
${MSG_NO_PRODUCTS}          No products found. Please add one before creating an order.
${MSG_UNABLE_TO_CREATE}     Unable to create an order. Please try again later.
${MSG_NOT_CREATED}          Failed to create an order. Please try again later.
${MSG_BAD_REQUEST}          Incorrect request body


*** Test Cases ***
Create Order Modal — Does Not Open When No Customers
    [Documentation]    Mock empty customers list — modal stays hidden, toast shown.
    ${mock_product}=    DataGen.Build Mock Product
    VAR    @{products}    ${mock_product}
    Open Orders List And Wait For Table
    Mock.Mock Get All Customers    ${{[]}}
    Mock.Mock Get All Products    ${products}
    Click Create Order Button
    Wait For Elements State    ${CREATE_ORDER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Toast Message    ${MSG_NO_CUSTOMERS}

Create Order Modal — Does Not Open When Customers 500 Error
    [Documentation]    Mock customers/all 500 error — modal stays hidden, toast shown.
    ${mock_product}=    DataGen.Build Mock Product
    VAR    @{products}    ${mock_product}
    Open Orders List And Wait For Table
    Mock.Mock Response With Status    **/api/customers/all
    ...    ${{{"IsSuccess": False, "ErrorMessage": None}}}    500
    Mock.Mock Get All Products    ${products}
    Click Create Order Button
    Wait For Elements State    ${CREATE_ORDER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Toast Message    ${MSG_UNABLE_TO_CREATE}

Create Order Modal — Does Not Open When No Products
    [Documentation]    Mock empty products list — modal stays hidden, toast shown.
    ${mock_customer}=    DataGen.Build Mock Customer
    VAR    @{customers}    ${mock_customer}
    Open Orders List And Wait For Table
    Mock.Mock Get All Customers    ${customers}
    Mock.Mock Get All Products    ${{[]}}
    Click Create Order Button
    Wait For Elements State    ${CREATE_ORDER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Toast Message    ${MSG_NO_PRODUCTS}

Create Order Modal — Does Not Open When Products 500 Error
    [Documentation]    Mock products/all 500 error — modal stays hidden, toast shown.
    ${mock_customer}=    DataGen.Build Mock Customer
    VAR    @{customers}    ${mock_customer}
    Open Orders List And Wait For Table
    Mock.Mock Get All Customers    ${customers}
    Mock.Mock Response With Status    **/api/products/all
    ...    ${{{"IsSuccess": False, "ErrorMessage": None}}}    500
    Click Create Order Button
    Wait For Elements State    ${CREATE_ORDER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Toast Message    ${MSG_UNABLE_TO_CREATE}

Create Order Modal — Redirects To Login When Customers 401
    [Documentation]    Mock customers/all 401 — modal hidden, app redirects to login.
    ${mock_product}=    DataGen.Build Mock Product
    VAR    @{products}    ${mock_product}
    Open Orders List And Wait For Table
    Mock.Mock Response With Status    **/api/customers/all
    ...    ${{{"IsSuccess": False, "ErrorMessage": "Not authorized"}}}    401
    Mock.Mock Get All Products    ${products}
    Click Create Order Button
    Wait For Elements State    ${CREATE_ORDER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Elements State    css=\#emailinput    visible    timeout=${DEFAULT_TIMEOUT}

Create Order Modal — Redirects To Login When Products 401
    [Documentation]    Mock products/all 401 — modal hidden, app redirects to login.
    ${mock_customer}=    DataGen.Build Mock Customer
    VAR    @{customers}    ${mock_customer}
    Open Orders List And Wait For Table
    Mock.Mock Get All Customers    ${customers}
    Mock.Mock Response With Status    **/api/products/all
    ...    ${{{"IsSuccess": False, "ErrorMessage": "Not authorized"}}}    401
    Click Create Order Button
    Wait For Elements State    ${CREATE_ORDER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Elements State    css=\#emailinput    visible    timeout=${DEFAULT_TIMEOUT}

Create Order — Error Toast On 400 Response
    [Documentation]    Submit form with mocked 400 POST response — bad request error toast shown.
    ${mock_customer}=    DataGen.Build Mock Customer
    ${mock_product}=    DataGen.Build Mock Product
    VAR    @{customers}    ${mock_customer}
    VAR    @{products}    ${mock_product}
    Mock.Mock Create Order Response
    ...    ${{{"IsSuccess": False, "ErrorMessage": "Incorrect request body"}}}    400
    Open Modal And Fill First Row    ${customers}    ${products}    ${mock_customer}[name]    ${mock_product}[name]
    Submit Create Order Form
    Wait For Toast Message    ${MSG_BAD_REQUEST}

Create Order — Error Toast On 500 Response
    [Documentation]    Submit form with mocked 500 POST response — generic error toast shown.
    ${mock_customer}=    DataGen.Build Mock Customer
    ${mock_product}=    DataGen.Build Mock Product
    VAR    @{customers}    ${mock_customer}
    VAR    @{products}    ${mock_product}
    Mock.Mock Create Order Response
    ...    ${{{"IsSuccess": False, "ErrorMessage": None}}}    500
    Open Modal And Fill First Row    ${customers}    ${products}    ${mock_customer}[name]    ${mock_product}[name]
    Submit Create Order Form
    Wait For Toast Message    ${MSG_NOT_CREATED}

Create Order Modal — Customers Dropdown Shows Mocked Data
    [Documentation]    Two mocked customers appear as selectable options in the dropdown.
    ${customer1}=    DataGen.Build Mock Customer    name=Alice Mock
    ${customer2}=    DataGen.Build Mock Customer    name=Bob Mock
    ${mock_product}=    DataGen.Build Mock Product
    VAR    @{customers}    ${customer1}    ${customer2}
    VAR    @{products}    ${mock_product}
    Open Modal With Customers And Products    ${customers}    ${products}
    Select Customer In Modal    Alice Mock
    Select Customer In Modal    Bob Mock

Create Order Modal — Products Dropdown Shows Mocked Data
    [Documentation]    Two mocked products appear as selectable options in the dropdown.
    ${mock_customer}=    DataGen.Build Mock Customer
    ${product1}=    DataGen.Build Mock Product    name=Widget Alpha
    ${product2}=    DataGen.Build Mock Product    name=Widget Beta
    VAR    @{customers}    ${mock_customer}
    VAR    @{products}    ${product1}    ${product2}
    Open Modal With Customers And Products    ${customers}    ${products}
    Select Product In Modal    Widget Alpha    1
    Select Product In Modal    Widget Beta    1


*** Keywords ***
Open Orders List And Wait For Table
    [Documentation]    Opens the orders list page and waits for the table to render.
    Open Orders List Page
    Wait For Orders Table

Open Modal With Customers And Products
    [Documentation]    Opens orders list, mocks customers/products endpoints, then opens the modal.
    [Arguments]    ${customers}    ${products}
    Open Orders List And Wait For Table
    Mock.Mock Get All Customers    ${customers}
    Mock.Mock Get All Products    ${products}
    Click Create Order Button
    Wait For Create Order Modal

Open Modal And Fill First Row
    [Documentation]    Opens orders list, mocks endpoints, opens modal, selects customer and product.
    [Arguments]    ${customers}    ${products}    ${customer_name}    ${product_name}
    Open Orders List And Wait For Table
    Mock.Mock Get All Customers    ${customers}
    Mock.Mock Get All Products    ${products}
    Click Create Order Button
    Wait For Create Order Modal
    Select Customer In Modal    ${customer_name}
    Select Product In Modal    ${product_name}    1
