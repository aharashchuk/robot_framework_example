*** Settings ***
Documentation       Comments UI service keywords — add and delete comment flows via the order details page.

Resource            resources/ui/pages/orders/order_details_page.resource


*** Variables ***
${COMMENT_CARDS}    css=\#comments-tab-container div.shadow-sm.rounded.mx-3


*** Keywords ***
Add Comment Via UI
    [Documentation]    Navigates to the Comments tab of the given order and adds a comment.
    [Arguments]    ${order_id}    ${comment_text}
    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Add Comment    ${comment_text}

Delete First Comment Via UI
    [Documentation]    Navigates to the Comments tab and deletes the first comment card.
    ...    Comment cards start at :nth-child(3) — after h4 and the textarea div.
    [Arguments]    ${order_id}
    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Click    ${COMMENTS_TAB}
    Wait For Elements State
    ...    css=#comments-tab-container > div.shadow-sm:nth-child(3)
    ...    visible
    ...    timeout=${DEFAULT_TIMEOUT}
    Click    css=#comments-tab-container > div.shadow-sm:nth-child(3) button[name="delete-comment"]
    Wait For Spinner To Disappear

Delete All Comments Via UI
    [Documentation]    Navigates to the Comments tab and deletes all comment cards one by one.
    ...    Comment cards start at :nth-child(3) — after h4 and the textarea div.
    [Arguments]    ${order_id}
    Open Order Details Page    ${order_id}
    Wait For Order Details Page
    Click    ${COMMENTS_TAB}
    WHILE    True    limit=50
        ${count}=    Get Element Count    ${COMMENT_CARDS}
        IF    ${count} == 0    BREAK
        Click    css=#comments-tab-container > div.shadow-sm:nth-child(3) button[name="delete-comment"]
        Wait For Spinner To Disappear
    END

Verify Comment Visible
    [Documentation]    Verifies that a comment with the given text is visible on the Comments tab.
    [Arguments]    ${comment_text}
    Click    ${COMMENTS_TAB}
    Wait For Elements State
    ...    css=#comments-tab-container div.shadow-sm.rounded.mx-3:has-text("${comment_text}")
    ...    visible
    ...    timeout=${DEFAULT_TIMEOUT}
