function getAuthorizationCookie() {
  const cookieValue = document.cookie.split("; ").find((row) => row.startsWith("Authorization="));
  return cookieValue ? `Bearer ${cookieValue?.split("=")[1]}` : "";
}

function removeAuthorizationCookie() {
  document.cookie = "Authorization" + "=; expires=Thu, 01-Jan-70 00:00:01 GMT;";
}

async function sendRequest(options) {
  const request = axios.create();
  let response;
  options.timeout ? options.timeout : 120000;
  try {
    response = await request(options);
  } catch (err) {
    return err.response;
    // console.log('Error', err.isAxiosError ? err.message : err)
    // console.log('Request URL:', options.method, options.url)
    if (err.response.status >= STATUS_CODES.BAD_REQUEST && err.response.status < STATUS_CODES.INTERNAL_SERVER_ERROR) {
      return err.response;
    }
  } finally {
    // hideSpinner();
  }
  return response;
}

function logout() {
  removeAuthorizationCookie();
  setRoute(ROUTES.SIGNIN);
}

function handleApiErrors(response, errorToNotification = false) {
  if (response.status === STATUS_CODES.UNAUTHORIZED) {
    logout();
  } else {
    if (response.status === STATUS_CODES.NOT_FOUND) {
      renderNotFoundPage();
    } else if (errorToNotification && response.status < STATUS_CODES.INTERNAL_SERVER_ERROR) {
      renderNotification(
        { message: response.data.ErrorMessage ? response.data.ErrorMessage : ERROR_MESSAGES["Connection Issue"] },
        true
      );
    } else {
      activateNavigationMenuItem();
      renderErrorPage(response.status);
    }
  }
}

function renderErrorPage(status) {
  document.getElementById(CONTENT_CONTAINER_ID).innerHTML = renderErrorPageLayout(status);
}

async function submitEntiti(options, notificationOprions) {
  let response;
  switch (options.path) {
    case "Products":
      response = options.requestOpts.body._id
        ? await ProductsService.editProduct(options.requestOpts.body)
        : await ProductsService.createProduct(options.requestOpts.body);
      break;

    case "Customers":
      response = options.requestOpts.body._id
        ? await CustomersService.editCustomer(options.requestOpts.body)
        : await CustomersService.createCustomer(options.requestOpts.body);
      break;
  }

  // hideSpinner();
  if (response.data.IsSuccess) {
    clearAllInputs(options.inputs);
    renderNotification(notificationOprions);
    switch (options.path) {
      case "Products":
        setRoute(ROUTES.PRODUCTS);
        break;

      case "Customers":
        setRoute(ROUTES.CUSTOMERS);
        break;
    }
  } else {
    handleApiErrors(response, true);
  }
}

async function submitOrder(orderData, closeModalFunc) {
  const response = orderData._id
    ? await OrdersService.editOrder(orderData)
    : await OrdersService.createOrder(orderData);
  response.data.IsSuccess
    ? orderData._id
      ? renderNotification({ message: SUCCESS_MESSAGES["Order Successfully Updated"] })
      : renderNotification({ message: SUCCESS_MESSAGES["New Order Added"] })
    : handleApiErrors(response, true);
  if (closeModalFunc) closeModalFunc();
  if (isOnOrderDetails(orderData._id)) {
    await renderOrderDetailsPage(orderData._id);
  } else {
    orderData._id ? setRoute(ROUTES.ORDER_DETAILS(orderData._id)) : setRoute(ROUTES.ORDERS);
  }
}

async function submitDelivery(orderId, delivery) {
  // showSpinner();
  const response = await OrdersService.submitDelivery(orderId, delivery);
  if (response.data.IsSuccess) {
    renderNotification({ message: SUCCESS_MESSAGES["Delivery Saved"] });
    // await renderOrderDetailsPage(orderId);
    setRoute(ROUTES.ORDER_DETAILS(orderId));
  } else {
    handleApiErrors(response, true);
  }
  // hideSpinner();
}

async function submitReceivedProducts(_id, products) {
  const response = await OrdersService.receiveProducts(_id, products);
  if (response.data.IsSuccess) {
    renderNotification({ message: SUCCESS_MESSAGES["Products Successfully Received"] });
    await renderOrderDetailsPage(_id);
  } else {
    handleApiErrors(response, true);
  }
  // hideSpinner();
}

async function submitComment(_id, comment) {
  const response = await OrdersService.createComment(_id, comment);
  if (response.data.IsSuccess) {
    renderNotification({ message: SUCCESS_MESSAGES["Comment Successfully Created"] });
    comments;
    renderCommentsTab(response.data.Order);
  } else {
    handleApiErrors(response, true);
    renderCommentsTab(state.data.Order);
  }
}

async function deleteComment(_id, commentId) {
  const response = await OrdersService.deleteComment(_id, commentId);
  const orderResponse = await OrdersService.getOrders(state.order._id);
  if (response.status === STATUS_CODES.DELETED && orderResponse.status === STATUS_CODES.OK) {
    state.order = orderResponse.data.Order;
    renderNotification({ message: SUCCESS_MESSAGES["Comment Successfully Deleted"] });
    renderCommentsTab(orderResponse.data.Order);
  } else {
    handleApiErrors(response, true);
    renderCommentsTab(state.data.Order);
  }
}

async function getSortedProducts() {
  const searchString = state.search.products;
  const filterOnPage = Object.keys(state.filtering.products).filter((c) => state.filtering.products[c]);
  const { page, limit } = state.pagination.products;

  const params = {
    ...(filterOnPage.length && { manufacturer: filterOnPage }),
    ...(searchString && { search: searchString }),
    ...state.sorting.products,
    page,
    limit,
  };

  const response = await ProductsService.getSortedProducts(params);
  if (response.data.IsSuccess) {
    return response;
  } else {
    handleApiErrors(response, true);
  }
}

async function getSortedCustomers() {
  const searchString = state.search.customers;
  const filterOnPage = [...Object.keys(state.filtering.customers).filter((c) => state.filtering.customers[c])];
  const { page, limit } = state.pagination.customers;

  const params = {
    ...(filterOnPage.length && { country: filterOnPage }),
    ...(searchString && { search: searchString }),
    ...state.sorting.customers,
    page,
    limit,
  };

  const response = await CustomersService.getSorted(params);
  if (response.data.IsSuccess) {
    return response;
  } else {
    handleApiErrors(response, true);
  }
}

async function getSortedOrders() {
  const searchString = state.search.orders;
  const filterOnPage = Object.keys(state.filtering.orders).filter((c) => state.filtering.orders[c]);
  const { page, limit } = state.pagination.orders;

  const params = {
    ...(filterOnPage.length && { status: filterOnPage }),
    ...(searchString && { search: searchString }),
    ...state.sorting.orders,
    page,
    limit,
  };

  const response = await OrdersService.getSorted(params);
  if (response.data.IsSuccess) {
    return response;
  } else {
    handleApiErrors(response, true);
  }
}

function generateUrlParams(params) {
  if (!params) return "";
  let url = "?";
  for (const key of Object.keys(params)) {
    if (Array.isArray(params[key])) {
      for (const value of params[key]) {
        url += `${url.length === 1 ? "" : "&"}${key}=${value.replaceAll(" ", "%20")}`;
      }
    } else {
      url += `${url.length === 1 ? "" : "&"}${key}=${String(params[key]).replaceAll(" ", "%20")}`;
    }
  }
  return url;
}

async function getDataAndRenderTable(page) {
  if (page === "products") {
    await getProductsAndRenderTable();
  } else if (page === "customers") {
    await getCustomersAndRenderTable();
  } else if (page === "orders") {
    await getOrdersAndRenderTable();
  }
}

async function getCustomerOrders(customerId) {
  const response = await CustomersService.getOrders(customerId);
  if (response.data.IsSuccess) {
    return response;
  } else {
    handleApiErrors(response, true);
  }
}
