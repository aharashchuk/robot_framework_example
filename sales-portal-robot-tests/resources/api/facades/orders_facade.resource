*** Settings ***
Documentation       Orders API facade — cross-domain keywords for full order lifecycle flows.

Library             libraries/api/api_client.py    AS    ApiClient
Library             libraries/api/endpoints/orders_api_library.py    AS    OrdersApi
Library             libraries/utils/validation_library.py    AS    Validation
Library             libraries/utils/data_generator_library.py    AS    DataGen
Resource            resources/api/service/orders_service.resource


*** Keywords ***
Create Full Order Lifecycle
    [Documentation]    Creates customer + product + order, adds delivery, starts processing, receives all products.
    [Arguments]    ${token}    ${num_products}=${1}
    ${delivery_resp}=    Create Order With Delivery And Track    ${token}    ${num_products}
    VAR    ${order_id}=    ${delivery_resp.body["Order"]["_id"]}
    ${status_resp}=    OrdersApi.Update Order Status    ${token}    ${order_id}
    ...    ${{ {"status": "In Process"} }}
    Validation.Validate Response    ${status_resp}    200
    ${product_ids}=    Evaluate
    ...    [p["_id"] for p in $status_resp.body["Order"]["products"]]
    ${receive_resp}=    OrdersApi.Receive Order Products    ${token}    ${order_id}
    ...    ${{ {"products": $product_ids} }}
    Validation.Validate Response    ${receive_resp}    200
    RETURN    ${receive_resp}
