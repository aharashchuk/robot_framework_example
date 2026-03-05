*** Settings ***
Documentation       Integration tests — Edit Customer modal in Order Details with mocked API responses.
Metadata            Suite        UI
Metadata            Sub-Suite    Integration

Library             Browser
Library             libraries/mock/mock_library.py                AS    Mock
Library             libraries/utils/data_generator_library.py    AS    DataGen

Resource            resources/ui/ui_suite_setup.resource
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/customers_service.resource
Resource            resources/api/service/orders_service.resource
Resource            resources/ui/pages/orders/order_details_page.resource
Resource            resources/ui/pages/orders/edit_customer_modal.resource
Resource            resources/ui/pages/sales_portal_page.resource

Suite Setup         Setup Integration Suite
Suite Teardown      Teardown Integration Browser
Test Setup          Setup Integration Test Context
Test Teardown       Run Keywords
...                 Take Screenshot On Failure    AND
...                 Full Delete Entities    ${ADMIN_TOKEN}    AND
...                 Teardown Integration Test Context
Test Tags           integration    ui    orders    regression


*** Variables ***
${ADMIN_TOKEN}          ${EMPTY}
${CURRENT_ORDER_ID}     ${EMPTY}
${MSG_UNABLE_UPDATE}    Unable to update customer. Please try again later.
${MSG_FAILED_UPDATE}    Failed to update customer. Please try again later.


*** Test Cases ***
Edit Customer Modal — Does Not Open When Customers 500 Error
    [Documentation]    Mock customers/all 500 error — modal stays hidden, toast shown.
    Create Fresh Order And Open Details
    Mock.Mock Response With Status    **/api/customers/all
    ...    ${{{"IsSuccess": False, "ErrorMessage": None}}}    500
    Click Edit Customer Pencil
    Wait For Elements State    ${EDIT_CUSTOMER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Toast Message    ${MSG_UNABLE_UPDATE}

Edit Customer Modal — Redirects To Login When Customers 401
    [Documentation]    Mock customers/all 401 — modal hidden, app redirects to login.
    Create Fresh Order And Open Details
    Mock.Mock Response With Status    **/api/customers/all
    ...    ${{{"IsSuccess": False, "ErrorMessage": "Not authorized"}}}    401
    Click Edit Customer Pencil
    Wait For Elements State    ${EDIT_CUSTOMER_MODAL}    hidden    timeout=${DEFAULT_TIMEOUT}
    Wait For Elements State    css=\#emailinput    visible    timeout=${DEFAULT_TIMEOUT}

Edit Customer Modal — Dropdown Shows Mocked Customers
    [Documentation]    Mock two customers in customers/all — both appear as selectable options.
    Create Fresh Order And Open Details
    ${customer1}=    DataGen.Build Mock Customer    name=Mocked Alice
    ${customer2}=    DataGen.Build Mock Customer    name=Mocked Bob
    VAR    @{customers}    ${customer1}    ${customer2}
    Mock.Mock Get All Customers    ${customers}
    Click Edit Customer Pencil
    Wait For Edit Customer Modal
    Select Customer In Edit Modal    Mocked Alice
    Select Customer In Edit Modal    Mocked Bob

Edit Customer — Error Toast On 400 Response
    [Documentation]    Select second customer, mock PUT 400 on save — error toast shown.
    Create Fresh Order And Open Details
    ${second_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${second_name}=    ${second_resp.body["Customer"]["name"]}
    Click Edit Customer Pencil
    Wait For Edit Customer Modal
    Select Customer In Edit Modal    ${second_name}
    Mock.Mock Order By Id Response
    ...    ${{{"IsSuccess": False, "ErrorMessage": "Incorrect request body"}}}
    ...    ${CURRENT_ORDER_ID}    400
    Save Edit Customer Modal
    Wait For Toast Message    ${MSG_FAILED_UPDATE}

Edit Customer — Error Toast On 500 Response
    [Documentation]    Select second customer, mock PUT 500 on save — error toast shown.
    Create Fresh Order And Open Details
    ${second_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${second_name}=    ${second_resp.body["Customer"]["name"]}
    Click Edit Customer Pencil
    Wait For Edit Customer Modal
    Select Customer In Edit Modal    ${second_name}
    Mock.Mock Order By Id Response
    ...    ${{{"IsSuccess": False, "ErrorMessage": None}}}
    ...    ${CURRENT_ORDER_ID}    500
    Save Edit Customer Modal
    Wait For Toast Message    ${MSG_FAILED_UPDATE}

Edit Customer — Redirects To Login When Order 401 During Save
    [Documentation]    Select second customer, mock PUT 401 on save — app logs out.
    Create Fresh Order And Open Details
    ${second_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${second_name}=    ${second_resp.body["Customer"]["name"]}
    Click Edit Customer Pencil
    Wait For Edit Customer Modal
    Select Customer In Edit Modal    ${second_name}
    Mock.Mock Order By Id Response
    ...    ${{{"IsSuccess": False, "ErrorMessage": "Not authorized"}}}
    ...    ${CURRENT_ORDER_ID}    401
    Save Edit Customer Modal
    Wait For Elements State    css=\#emailinput    visible    timeout=${DEFAULT_TIMEOUT}


*** Keywords ***
Setup Integration Suite
    [Documentation]    Gets admin token and creates the browser instance.
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE    # robocop: off=VAR05
    Setup Integration Browser

Create Fresh Order And Open Details
    [Documentation]    Creates a new order via API, opens its details page in the current context.
    ${order_resp}=    Create Order And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    VAR    ${CURRENT_ORDER_ID}    ${order_id}    scope=SUITE    # robocop: off=VAR05
    Open Order Details Page    ${order_id}
    Wait For Order Details Page
