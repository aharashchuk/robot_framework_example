function renderProductsPageLayout(options = ProductsProps, response = {}) {
  ProductsProps.data = response.data;
  options.tableProps.currentSortingField.direction = state.sorting.products.sortOrder;
  options.tableProps.currentSortingField.name = replaceApiToFeKeys[state.sorting.products.sortField];

  const data = _.isEmpty(response.data.Products) ? [] : transformProductsForTable(response.data.Products);

  ProductsProps.data = response.data.Products;
  state.data.products = data;

  return `      
      <div class="bg-body p-3">
        <div id="${PAGE_TITLE_ID}" class="p-horizontal-20">  
            <div class="page-header-flex ml-20">
                ${generatePageTitle(options)}
                ${generateButton(options.buttons.add)}
            </div>
                ${searchBar(options.buttons)}
                ${chipsSection()}
        </div>
      </div>      
      <div class="shadow-sm p-3 mb-5 bg-body rounded  page-title-margin">
          <div id="${CONTENT_ID}" data-name="table-products">
              ${generateTableBootstrap(data, options)}
          </div>
      </div>`;
}

const ProductsProps = {
  path: "Products",
  title: "Products List",
  classlist: "fw-bold",
  buttons: {
    add: {
      classlist: "btn btn-primary page-title-header page-title-button d-inline-flex align-items-center",
      name: "+ Add Product",
      href: ROUTES.PRODUCT_ADD,
      attributes: ['name="add-button"'],
    },
    search: {
      classlist: "btn btn-primary d-flex justify-content-center align-items-center",
      name: `<i class="fa-solid fa-magnifying-glass me-2"></i> Search`,
      id: "search-products",
      type: "submit",
      disabled: true,
    },
  },
  tableProps: {
    id: "table-products",
    defaultHeaders: ["Name", "Price", "Manufacturer", "Created On"],
    sortableFields: ["Name", "Price", "Manufacturer", "Created On"],
    currentSortingField: {
      name: "Created On",
      direction: "desc",
    },
    sortFunction: sortProductsInTable,
    buttons: [
      {
        nestedItems: `<i class="bi bi-card-text"></i>`,
        title: "Details",
        classlist: "btn btn-link table-btn",
        onclick: "renderProductDetailsModal",
      },
      {
        nestedItems: `<i class="bi bi-pencil"></i>`,
        title: "Edit",
        classlist: "btn btn-link table-btn",
        href: ROUTES.PRODUCT_EDIT,
      },
      {
        nestedItems: `<i class="bi bi-trash"></i>`,
        title: "Delete",
        classlist: "btn btn-link text-danger table-btn",
        onclick: "renderDeleteProductModal",
      },
    ],
  },
};

const delete_product_confirmation_opts = {
  title: '<i class="bi bi-trash me-2"></i> Delete Product',
  body: "Are you sure you want to delete product?",
  deleteFunction: "deleteProduct",
  buttons: {
    success: {
      name: "Yes, Delete",
      id: "delete-product-modal-btn",
    },
    cancel: {
      name: "Cancel",
      id: "cancel-product-modal.btn",
    },
  },
};

const delete_product_on_products_confirmation_opts = {
  title: '<i class="bi bi-trash me-2"></i> Delete Product',
  body: "Are you sure you want to delete product?",
  deleteFunction: "deleteProductOnProducts",
  buttons: {
    success: {
      name: "Yes, Delete",
      id: "delete-product-modal-btn",
    },
    cancel: {
      name: "Cancel",
      id: "cancel-product-modal.btn",
    },
  },
};

async function deleteProduct(id, confirmButton) {
  setSpinnerToButton(confirmButton);
  $('[name="confirmation-modal"] button.btn-secondary').prop("disabled", true);
  const response = await ProductsService.deleteProduct(id);
  removeConfimationModal();
  await showNotificationAfterDeleteRequest(
    response,
    { message: SUCCESS_MESSAGES["Product Successfully Deleted"]("Product") },
    ProductsProps
  );
}

async function deleteProductOnProducts(id, confirmButton) {
  setSpinnerToButton(confirmButton);
  $('[name="confirmation-modal"] button.btn-secondary').prop("disabled", true);
  const response = await ProductsService.deleteProduct(id);
  removeConfimationModal();
  if (response.status === STATUS_CODES.DELETED) {
    // await renderPages[pageProps.path](pageProps);
    getProductsAndRenderTable();
    renderNotification({ message: SUCCESS_MESSAGES["Product Successfully Deleted"]("Product") });
  } else {
    handleApiErrors(response, true);
  }
}

function renderEditProductPageFromModal(id) {
  removeDetailsModal();
  renderEditProductPage(id);
}

const product_details_props = (id) => {
  return {
    id,
    path: "Product",
    buttons: {
      edit: {
        href: ROUTES.PRODUCT_EDIT(id),
      },
    },
  };
};

function addEventListelersToProductsPage() {
  // $("button.page-title-button").on("click", () => renderAddNewProductPage());
  $(`#${ProductsProps.buttons.search.id}`).on("click", async (event) => {
    event.preventDefault();
    const value = $(`input[type="search"]`).val();

    $(`input[type="search"]`).val("");
    const searchButton = $("[id*=search-]");
    searchButton.prop("disabled", true);

    if (state.search.products) {
      removeChipButton("search", "products");
    }
    if (value) {
      renderChipButton(value, "products");
    }
    state.search.products = value;
    await getProductsAndRenderTable();
  });

  $(`#filter`).on("click", (event) => {
    event.preventDefault();
    renderFiltersModal("products");
  });
}

function transformProductsForTable(products) {
  return products.map((el) => {
    return {
      [replaceApiToFeKeys._id]: el._id,
      [replaceApiToFeKeys.name]: el.name,
      [replaceApiToFeKeys.price]: `$${el.price}`,
      [replaceApiToFeKeys.manufacturer]: el.manufacturer,
      [replaceApiToFeKeys.createdOn]: convertToDateAndTime(el.createdOn),
    };
  });
}

function renderProductsTable(products, options, sorting) {
  $('[data-name="table-products"]').html(generateTableBootstrap(transformProductsForTable(products), options, sorting));
}

async function getProductsAndRenderTable() {
  showTableSpinner();
  const response = (await getSortedProducts()).data;
  const { Products: sortedProducts, sorting, total, page, limit } = response;

  const totalPages = Math.max(Math.ceil(total / limit), 1);
  if (sortedProducts.length === 0 && page > totalPages) {
    state.pagination.products.page = totalPages;
    return await getProductsAndRenderTable(); // повторный запрос
  }

  if (state.checkPage(PAGES.PRODUCTS)) {
    ProductsProps.tableProps.currentSortingField.direction = state.sorting.products.sortOrder;
    ProductsProps.tableProps.currentSortingField.name = replaceApiToFeKeys[state.sorting.products.sortField];

    const transformed = transformProductsForTable(sortedProducts);
    const pagination = renderPaginationControls("products", total, page, limit);

    const tableHTML = generateTableBootstrap(transformed, ProductsProps, sorting, pagination);
    $('[data-name="table-products"]').html(tableHTML);
  }
}

async function exportDataToFile(data, type) {
  if (type === "json") {
    exportJson(data);
  } else if (type === "csv") {
    exportCsv(data);
  }
}
