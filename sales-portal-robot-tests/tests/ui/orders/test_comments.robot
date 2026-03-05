*** Settings ***
Documentation       UI tests — Add and delete comments on order details page
Metadata            Suite        UI
Metadata            Sub-Suite    Orders

Library             Collections
Library             Browser
Library             libraries/stores/entity_store_library.py    AS    EntityStore
Library             libraries/api/endpoints/orders_api_library.py    AS    OrdersApi

Resource            resources/ui/ui_suite_setup.resource
Resource            resources/api/service/login_service.resource
Resource            resources/api/service/orders_service.resource
Resource            resources/ui/pages/orders/order_details_page.resource
Resource            resources/ui/service/comments_ui_service.resource

Suite Setup         Setup UI Suite
Suite Teardown      Teardown UI Browser Context
Test Teardown       Full Delete Entities    ${ADMIN_TOKEN}
Test Tags           ui    orders


*** Variables ***
${ADMIN_TOKEN}    ${EMPTY}
${COMMENT_CARDS}    css=#comments-tab-container div.shadow-sm.rounded.mx-3


*** Test Cases ***
Comments — Add Comment And Verify Count Is 1
    [Documentation]    Adds a comment via UI to an In Process order; verify count becomes 1.
    [Tags]    smoke
    ${order_resp}=    Create Order In Process And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Add Comment Via UI    ${order_id}    Hello World comment
    ${count}=    Get Element Count    ${COMMENT_CARDS}
    Should Be Equal As Integers    ${count}    1

Comments — Create Button Disabled For Empty Textarea
    [Documentation]    Create button disabled when empty, enabled with text, disabled after clearing.
    [Tags]    smoke
    ${order_resp}=    Create Order In Process And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Click    ${COMMENTS_TAB}
    Get Element States    ${CREATE_COMMENT_BTN}    *=    disabled
    Fill Text    ${COMMENTS_TEXTAREA}    Some text
    Get Element States    ${CREATE_COMMENT_BTN}    *=    enabled
    Clear Text    ${COMMENTS_TEXTAREA}
    Get Element States    ${CREATE_COMMENT_BTN}    *=    disabled

Comments — Add 3 Comments Newest First
    [Documentation]    Adds 3 comments sequentially; verifies newest is shown first.
    [Tags]    regression
    ${order_resp}=    Create Order In Process And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}

    Add Comment Via UI    ${order_id}    First comment
    Add Comment    Second comment
    Add Comment    Third comment
    ${count}=    Get Element Count    ${COMMENT_CARDS}
    Should Be Equal As Integers    ${count}    3
    Get Text    css=#comments-tab-container > div.shadow-sm:nth-child(3)    contains    Third comment
    Get Text    css=#comments-tab-container > div.shadow-sm:nth-child(4)    contains    Second comment
    Get Text    css=#comments-tab-container > div.shadow-sm:nth-child(5)    contains    First comment

Comments — Delete First Of 3 Comments
    [Documentation]    Adds 3 comments via API; deletes first via UI; count decreases to 2.
    [Tags]    regression
    ${order_resp}=    Create Order In Process And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    Add Three Comments Via API    ${order_id}

    Delete First Comment Via UI    ${order_id}
    ${count}=    Get Element Count    ${COMMENT_CARDS}
    Should Be Equal As Integers    ${count}    2

Comments — Delete All Comments
    [Documentation]    Adds 3 comments via API; deletes all via UI; count reaches 0.
    [Tags]    regression
    ${order_resp}=    Create Order In Process And Track    ${ADMIN_TOKEN}
    VAR    ${order_id}=    ${order_resp.body["Order"]["_id"]}
    FOR    ${text}    IN    Comment A    Comment B    Comment C
        VAR    &{comment_body}    comment=${text}
        OrdersApi.Add Order Comment    ${ADMIN_TOKEN}    ${order_id}    ${comment_body}
    END

    Delete All Comments Via UI    ${order_id}
    ${count}=    Get Element Count    ${COMMENT_CARDS}
    Should Be Equal As Integers    ${count}    0


*** Keywords ***
Setup UI Suite
    [Documentation]    Gets admin token and sets up browser context with auth state.
    ${token}=    Get Admin Token
    VAR    ${ADMIN_TOKEN}    ${token}    scope=SUITE    # robocop: off=VAR05
    Setup UI Browser Context

Add Three Comments Via API
    [Documentation]    Adds Comment 1, Comment 2, Comment 3 to the order via API.
    [Arguments]    ${order_id}
    FOR    ${text}    IN    Comment 1    Comment 2    Comment 3
        VAR    &{body}    comment=${text}
        OrdersApi.Add Order Comment    ${ADMIN_TOKEN}    ${order_id}    ${body}
    END
