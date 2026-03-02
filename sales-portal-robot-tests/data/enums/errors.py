"""Error message constants — mirrors backend VALIDATION_ERROR_MESSAGES and response error strings."""

from __future__ import annotations


class ValidationErrorMessages:
    """Validation error messages returned by the backend on 400 responses."""

    CUSTOMER_NAME = "Customer's name should contain only 1-40 alphabetical characters and one space between"
    CITY = "City's name should contain only 1-20 alphabetical characters and one space between"
    ADDRESS = "Address should contain only 1-20 alphanumerical characters and one space between"
    STREET = "Street should contain only 1-40 alphanumerical characters and one space between"
    HOUSE = "House number should be in range 1-999"
    FLAT = "Flat number should be in range 1-9999"
    EMAIL = "Invalid Email Address"
    PHONE = "Mobile Number should be at least 10 characters and start with a +"
    NOTES = "Notes should be in range 0-250 and without < or > symbols"
    PRODUCTS_NAME = "Products's name should contain only 3-40 alphanumerical characters and one space between"
    AMOUNT = "Amount should be in range 0-999"
    PRICE = "Price should be in range 1-99999"
    COUNTRY = "No such country is defined"
    MANUFACTURER = "No such manufacturer is defined"
    CUSTOMER = "Incorrect Customer"
    PRODUCT = "Incorrect Customer"
    DELIVERY = "Incorrect Delivery"
    BODY = "Incorrect request body"
    COMMENT_NOT_FOUND = "Comment was not found"
    GET_USERS = "Failed to get users"


class ResponseErrors:
    """Response error message templates returned by the backend."""

    BAD_REQUEST = "Incorrect request body"
    UNAUTHORIZED = "Not authorized"
    INCORRECT_DELIVERY = "Incorrect Delivery"
    INVALID_DATE = "Invalid final date"
    CUSTOMER_MISSING = "Missing customer"
    INVALID_ORDER_STATUS = "Invalid order status"
    ORDER_IS_NOT_PROCESSED = "Can't process order. Please, schedule delivery"
    INVALID_PAYLOAD = "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"

    @staticmethod
    def product_not_found(product_id: str) -> str:
        return f"Product with id '{product_id}' wasn't found"

    @staticmethod
    def customer_not_found(customer_id: str) -> str:
        return f"Customer with id '{customer_id}' wasn't found"

    @staticmethod
    def conflict(name: str) -> str:
        return f"Product with name '{name}' already exists"

    @staticmethod
    def manager_not_found(manager_id: str) -> str:
        return f"Manager with id '{manager_id}' wasn't found"

    @staticmethod
    def order_not_found(order_id: str) -> str:
        return f"Order with id '{order_id}' wasn't found"

    @staticmethod
    def product_not_requested(product_id: str) -> str:
        return f"Product with Id '{product_id}' is not requested"
