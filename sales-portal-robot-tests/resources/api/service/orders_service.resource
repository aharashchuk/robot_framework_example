*** Settings ***
Documentation       Orders API service keywords — high-level order flows with validation and tracking.

Library             Collections
Library             libraries/api/api_client.py    AS    ApiClient
Library             libraries/api/endpoints/orders_api_library.py    AS    OrdersApi
Library             libraries/utils/validation_library.py    AS    Validation
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Library             libraries/utils/data_generator_library.py    AS    DataGen
Resource            resources/api/service/products_service.resource
Resource            resources/api/service/customers_service.resource


*** Keywords ***
Create N Product Ids And Track
    [Documentation]    Creates N products, tracks each, and returns a list of their IDs.
    [Arguments]    ${token}    ${count}
    VAR    @{product_ids}=    @{EMPTY}
    FOR    ${_}    IN RANGE    ${count}
        ${resp}=    Create Product And Track    ${token}
        Append To List    ${product_ids}    ${resp.body["Product"]["_id"]}
    END
    RETURN    ${product_ids}

Create Order And Track
    [Documentation]    Creates a customer + N products + order with random data, tracks all IDs for cleanup.
    [Arguments]    ${token}    ${num_products}=${1}
    ${customer_resp}=    Create Customer And Track    ${token}
    VAR    ${customer_id}=    ${customer_resp.body["Customer"]["_id"]}
    ${product_ids}=    Create N Product Ids And Track    ${token}    ${num_products}
    ${order_data}=    DataGen.Generate Order Data    ${customer_id}    ${product_ids}
    ${order_resp}=    OrdersApi.Create Order    ${token}    ${order_data}
    Validation.Validate Response    ${order_resp}    201
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    EntityStore.Track Order    ${order_id}
    RETURN    ${order_resp}

Create Order With Delivery And Track
    [Documentation]    Creates an order and adds a scheduled delivery, tracks all IDs for cleanup.
    [Arguments]    ${token}    ${num_products}=${1}
    ${order_resp}=    Create Order And Track    ${token}    ${num_products}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${delivery_data}=    DataGen.Generate Delivery Data
    ${delivery_resp}=    OrdersApi.Add Order Delivery    ${token}    ${order_id}    ${delivery_data}
    Validation.Validate Response    ${delivery_resp}    200
    RETURN    ${delivery_resp}

Create Order In Process And Track
    [Documentation]    Creates an order with delivery and moves it to In Process. Tracks all IDs.
    [Arguments]    ${token}    ${num_products}=${1}
    ${delivery_resp}=    Create Order With Delivery And Track    ${token}    ${num_products}
    VAR    ${order_id}=    ${delivery_resp.body["Order"]["_id"]}
    ${status_body}=    Create Dictionary    status=In Process
    ${status_resp}=    OrdersApi.Update Order Status    ${token}    ${order_id}    ${status_body}
    Validation.Validate Response    ${status_resp}    200
    RETURN    ${status_resp}

Create Canceled Order And Track
    [Documentation]    Creates a draft order and cancels it. Tracks all IDs.
    [Arguments]    ${token}    ${num_products}=${1}
    ${order_resp}=    Create Order And Track    ${token}    ${num_products}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    ${status_body}=    Create Dictionary    status=Canceled
    ${status_resp}=    OrdersApi.Update Order Status    ${token}    ${order_id}    ${status_body}
    Validation.Validate Response    ${status_resp}    200
    RETURN    ${status_resp}

Delete Order By Id
    [Documentation]    Deletes an order by ID and validates 200.
    [Arguments]    ${token}    ${order_id}
    ${response}=    OrdersApi.Delete Order    ${token}    ${order_id}
    Validation.Validate Response    ${response}    200
    RETURN    ${response}

Full Delete Entities
    [Documentation]    Teardown keyword: deletes all tracked entities in correct order (orders → products → customers).
    [Arguments]    ${token}
    ${order_ids}=    EntityStore.Get Tracked Orders
    FOR    ${id}    IN    @{order_ids}
        OrdersApi.Delete Order    ${token}    ${id}
    END
    ${product_ids}=    EntityStore.Get Tracked Products
    FOR    ${id}    IN    @{product_ids}
        ProductsApi.Delete Product    ${token}    ${id}
    END
    ${customer_ids}=    EntityStore.Get Tracked Customers
    FOR    ${id}    IN    @{customer_ids}
        CustomersApi.Delete Customer    ${token}    ${id}
    END
    EntityStore.Clear Entity Store
