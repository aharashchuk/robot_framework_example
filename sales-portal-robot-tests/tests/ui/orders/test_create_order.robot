*** Settings ***
Documentation       UI tests — Create Order modal
Metadata            Suite        UI
Metadata            Sub-Suite    Orders

Library             Browser
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Library             libraries/utils/data_generator_library.py    AS    DataGen

Resource            resources/ui/ui_suite_setup.resource
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/products_service.resource
Resource            resources/api/service/customers_service.resource
Resource            resources/api/service/orders_service.resource
Resource            resources/ui/pages/orders/orders_list_page.resource
Resource            resources/ui/pages/orders/create_order_modal.resource
Resource            resources/ui/pages/sales_portal_page.resource

Suite Setup         Setup UI Suite
Suite Teardown      Teardown UI Browser Context
Test Teardown       Run Keywords    Take Screenshot On Failure    AND    Full Delete Entities    ${ADMIN_TOKEN}
Test Tags           regression    ui    orders


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}


*** Test Cases ***
Create Order — With 1 Product
    [Documentation]    Creates a customer and product via API, then creates an order via the modal.
    [Tags]    smoke
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_name}=    ${customer_resp.body["Customer"]["name"]}
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_name}=    ${product_resp.body["Product"]["name"]}

    Open Orders And Navigate To Create Modal
    Select Customer In Modal    ${customer_name}
    Add Product To Order    ${product_name}
    Finalize Order And Track

Create Order — With 5 Products
    [Documentation]    Creates a customer and 5 products via API, then creates an order via the modal.
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_name}=    ${customer_resp.body["Customer"]["name"]}
    ${products}=    Bulk Create Products    ${ADMIN_TOKEN}    5

    Open Orders And Navigate To Create Modal
    Select Customer In Modal    ${customer_name}
    Select Product In Modal    ${products}[0][name]    1
    FOR    ${product}    IN    @{products}[1:]
        Add Product To Order    ${product}[name]
    END
    Finalize Order And Track

Cancel Create Order Modal — No Order Created
    [Documentation]    Clicking Cancel in the create-order modal produces no toast.
    ${customer_resp}=    Create Customer And Track    ${ADMIN_TOKEN}
    VAR    ${customer_name}=    ${customer_resp.body["Customer"]["name"]}
    ${product_resp}=    Create Product And Track    ${ADMIN_TOKEN}
    VAR    ${product_name}=    ${product_resp.body["Product"]["name"]}

    Open Orders And Navigate To Create Modal
    Select Customer In Modal    ${customer_name}
    Add Product To Order    ${product_name}
    Cancel Create Order Modal

    Get Element Count    css=.toast.show    ==    0


*** Keywords ***
Setup UI Suite
    [Documentation]    Gets admin token and sets up browser context with auth state.
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE    # robocop: off=VAR05
    Setup UI Browser Context

Open Orders And Navigate To Create Modal
    [Documentation]    Opens orders list, waits for table, then opens the Create Order modal.
    Open Orders List Page
    Wait For Orders Table
    Click Create Order Button
    Wait For Create Order Modal

Finalize Order And Track
    [Documentation]    Submits the create-order form, waits for toast, tracks the order, and verifies Draft status.
    Submit Create Order Form
    Wait For Toast Message
    ${order_id}=    Get Newest Order Id From Table
    EntityStore.Track Order    ${order_id}
    Verify Order Status In Table    ${order_id}    Draft

Get Newest Order Id From Table
    [Documentation]    Returns the order ID from the first (newest) row of the orders table.
    Wait For Orders Table
    ${href}=    Get Attribute    css=#table-orders tbody tr:first-child a[title="Details"]    href
    ${order_id}=    Evaluate    "${href}".split("/")[-1]
    RETURN    ${order_id}

Verify Order Status In Table
    [Documentation]    Verifies the order row in the table has the expected status text.
    [Arguments]    ${order_id}    ${expected_status}
    Get Text    css=#table-orders tbody tr:has(td:text-is("${order_id}"))    contains    ${expected_status}
