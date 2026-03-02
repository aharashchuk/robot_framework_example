function renderOrdersPageLayout(options = OrdersProps, response = {}) {
  OrdersProps.data = response.data;
  options.tableProps.currentSortingField.direction = state.sorting.orders.sortOrder;
  options.tableProps.currentSortingField.name = replaceApiToFeKeys[state.sorting.orders.sortField];

  const data = _.isEmpty(response.data.Orders) ? [] : transformOrdersForTable(response.data.Orders);

  ProductsProps.data = response.data.Orders;
  state.data.orders = data;

  return `
    <div class="bg-body p-3">
        <div id="${PAGE_TITLE_ID}" class="p-horizontal-20">  
            <div class="page-header-flex ml-20">
                ${generatePageTitle(options)}
                ${generateButton(options.buttons.add)}
            </div>
            <div class="d-flex flex-wrap align-items-center gap-2">
                <form class="d-flex search-bar">
                  <input class="form-control me-2" id="search" type="search" placeholder="Type a value..." maxlength="40" aria-label="Search" oninput="seachButtonHandler(this)">
                  ${generateButton(options.buttons.search)}
                </form>
                <button class="btn btn-outline-primary ms-2 d-flex justify-content-start" id="filter">
                    <i class="bi bi-funnel me-2"></i> Filter
                </button>
                <button id="export" class="btn btn-primary ms-2 page-title-button" onclick="createExportModal()">Export</button>       
            </div>
                ${chipsSection()}
        </div>
    </div>      
    <div class="shadow-sm p-3 mb-5 bg-body rounded  page-title-margin">
        <div id="${CONTENT_ID}" data-name="table-orders">
            ${generateTableBootstrap(data, options)}
        </div>
    </div>`;
}

const OrdersProps = {
  path: "Orders",
  title: "Orders List",
  classlist: "fw-bold",
  buttons: {
    add: {
      classlist: "btn btn-primary page-title-header page-title-button",
      name: "Create Order",
      attributes: ['name="add-button"'],
    },
    search: {
      classlist: "btn btn-primary d-flex justify-content-center align-items-center",
      name: `<i class="fa-solid fa-magnifying-glass me-2"></i> Search`,
      id: "search-orders",
      type: "submit",
      disabled: true,
    },
  },
  tableProps: {
    id: "table-orders",
    defaultHeaders: [
      idToOrderNumber._id,
      replaceApiToFeKeys.email,
      replaceApiToFeKeys.price,
      replaceApiToFeKeys.delivery,
      replaceApiToFeKeys.status,
      replaceApiToFeKeys.assignedManager,
      replaceApiToFeKeys.createdOn,
    ],
    sortableFields: [
      idToOrderNumber._id,
      replaceApiToFeKeys.name,
      replaceApiToFeKeys.email,
      replaceApiToFeKeys.price,
      replaceApiToFeKeys.delivery,
      replaceApiToFeKeys.status,
      replaceApiToFeKeys.assignedManager,
      replaceApiToFeKeys.createdOn,
    ],
    currentSortingField: {
      name: replaceApiToFeKeys.createdOn,
      direction: "desc",
    },
    sortFunction: sortOrdersInTable,
    buttons: [
      {
        nestedItems: `<i class="bi bi-card-text"></i>`,
        title: "Details",
        classlist: "btn btn-link table-btn",
        href: ROUTES.ORDER_DETAILS,
      },
      // {
      //   nestedItems: `<i class="bi bi-arrow-repeat"></i>`,
      //   title: "Reorder",
      //   classlist: "btn btn-link table-btn",
      //   onclick: "renderOrderDetailsPage",
      //   isVisible: (order) => order.Status === ORDER_STATUSES.RECEIVED,
      // },
      {
        nestedItems: `<i class="bi bi-box-arrow-in-right"></i>`,
        title: "Reopen",
        classlist: "btn btn-link table-btn",
        onclick: "renderReopenOrderModal",
        isVisible: (order) => order.Status === ORDER_STATUSES.CANCELED,
      },
    ],
  },
};

function addEventListelersToOrdersPage() {
  $(`[name="add-button"]`).on("click", async (e) => {
    e.preventDefault();

    setSpinnerToButton(e.target);
    try {
      const [customers, products] = (
        await Promise.allSettled([CustomersService.getCustomers(), ProductsService.getProducts()])
      ).map((r) => r.value);
      state.page = PAGES.ORDERS;
      if (
        customers.status === STATUS_CODES.OK &&
        products.status === STATUS_CODES.OK &&
        products.data.Products.length > 0 &&
        customers.data.Customers.length > 0
      ) {
        createAddOrderModal({ customers: customers.data.Customers, products: products.data.Products });
        hideSpinners();
        sideMenuActivateElement("Orders");
      } else if (
        customers.status === STATUS_CODES.OK &&
        products.status === STATUS_CODES.OK &&
        products.data.Products.length === 0
      ) {
        renderNotification({ message: ERROR_MESSAGES["No products"] }, true);
      } else if (
        customers.status === STATUS_CODES.OK &&
        products.status === STATUS_CODES.OK &&
        customers.data.Customers.length === 0
      ) {
        renderNotification({ message: ERROR_MESSAGES["No customers"] }, true);
      } else if (customers.status === STATUS_CODES.UNAUTHORIZED || products.status === STATUS_CODES.UNAUTHORIZED) {
        removeAddOrderModal();
        const response = [customers, products].find((r) => r.status === STATUS_CODES.UNAUTHORIZED);
        handleApiErrors(response);
      } else {
        removeAddOrderModal();
        renderNotification({ message: ERROR_MESSAGES["Unable to create order"] }, true);
      }
    } catch (e) {
      console.error(e);
      renderErrorPage();
    } finally {
      hideSpinners();
      removeSpinnerFromButton(e.target, { innerText: "Create Order" });
    }
  });

  $(`#${OrdersProps.buttons.search.id}`).on("click", async (event) => {
    event.preventDefault();
    const value = $(`input[type="search"]`).val();

    $(`input[type="search"]`).val("");
    const searchButton = $("[id*=search-]");
    searchButton.prop("disabled", true);

    if (state.search.orders) {
      removeChipButton("search", "orders");
    }
    if (value) {
      renderChipButton(value, "orders");
    }
    state.search.orders = value;
    // searchInTable("orders");
    await getOrdersAndRenderTable();
  });

  $(`#filter`).on("click", (event) => {
    event.preventDefault();
    renderFiltersModal("orders");
  });
}

function transformOrdersForTable(orders) {
  return orders.map((el) => {
    return {
      [replaceApiToFeKeys._id]: el._id,
      [idToOrderNumber._id]: el._id,
      [replaceApiToFeKeys.email]: el.customer.email,
      [replaceApiToFeKeys.price]: `$${el.total_price}`,
      [replaceApiToFeKeys.delivery]: el.delivery ? convertToDate(el.delivery.finalDate) : "-",
      [replaceApiToFeKeys.status]: el.status,
      [replaceApiToFeKeys.assignedManager]: el.assignedManager ? createManagerDetailsLink(el.assignedManager) : "-",
      [replaceApiToFeKeys.createdOn]: convertToDateAndTime(el.createdOn),
    };
  });
}

function renderOrdersTable(orders, options, sorting) {
  $('[data-name="table-orders"]').html(generateTableBootstrap(transformOrdersForTable(orders), options, sorting));
}

async function getOrdersAndRenderTable() {
  showTableSpinner();
  const response = (await getSortedOrders()).data;
  const { Orders: sortedOrders, sorting, total, page, limit } = response;

  const totalPages = Math.max(Math.ceil(total / limit), 1);
  if (sortedOrders.length === 0 && page > totalPages) {
    state.pagination.orders.page = totalPages;
    return await getOrdersAndRenderTable(); // 🔁 повторный запрос
  }

  if (state.checkPage(PAGES.ORDERS)) {
    OrdersProps.tableProps.currentSortingField.direction = state.sorting.orders.sortOrder;
    OrdersProps.tableProps.currentSortingField.name =
      state.sorting.orders.sortField === "_id"
        ? idToOrderNumber[state.sorting.orders.sortField]
        : replaceApiToFeKeys[state.sorting.orders.sortField];

    const transformed = transformOrdersForTable(sortedOrders);
    const pagination = renderPaginationControls("orders", total, page, limit);
    const tableHTML = generateTableBootstrap(transformed, OrdersProps, sorting, pagination);

    $('[data-name="table-orders"]').html(tableHTML);
  }
}
