let orderModalWrap = null;
function createAddOrderModal(data) {
  add_order_modal_props.data = _.cloneDeep(data);
  add_order_modal_props.customers.options.values = add_order_modal_props.data.customers.map((c) => c.name);
  add_order_modal_props.customers.options.titles = add_order_modal_props.data.customers.map((c) => c.email);
  add_order_modal_props.products.options.values = add_order_modal_props.data.products.map((c) => c.name);
  if (orderModalWrap !== null) {
    orderModalWrap.remove();
  }
  orderModalWrap = document.createElement("div");
  orderModalWrap.id = `add-order-modal-id`;
  orderModalWrap.setAttribute("modal", "");
  orderModalWrap.insertAdjacentHTML(
    "afterbegin",
    `
            <div class="modal show fade" id="add-order-modal" tabindex="-1">
                <div class="modal-dialog-scrollable modal-dialog show">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-list-check me-2"></i>
                                Create Order
                            </h5>
                            <button type="button" class="btn-close hover-danger" data-bs-dismiss="modal" aria-label="Close" onClick="removeAddOrderModal();"></button>
                        </div>
                        <div class="modal-body position-relative" id="add-order-modal-body">
                            <div class="rounded-5">
                                <form class="row g-3 form-margin" id="create-order-form">
                                ${generateAddOrderModalBody()}
                                </form>
                            </div>
                            
                        </div>
                        <div class="modal-footer mx-4 justify-content-between">
                            <div class="me-5">
                                <i class="bi bi-tag"></i>
                                <span class="">Total Price:</span>
                                <span class="text-primary fw-bold" id="total-price-order-modal"></span>
                            </div>
                            <div>
                                <button type="submit" class="btn btn-primary mr-10" id="create-order-btn">Create</button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancel-order-modal-btn">Cancel</button>
                            </div>                          
                        </div>
                    </div>
                </div>
            </div>
    `
  );
  document.body.prepend(orderModalWrap);

  const ordersModal = new bootstrap.Modal(orderModalWrap.querySelector(".modal"));
  ordersModal.show();
  handleFirstDeleteButtonInOrderModal("products-section");
  setCurrentTotalPriceToOrderModal(add_order_modal_props.data.products);
  addEventListelersToAddOrderModal();
}

function addEventListelersToAddOrderModal() {
  $("#add-product-btn").on("click", (e) => {
    e.preventDefault();
    if ($("#products-section > div").length < 5) {
      handleFirstDeleteButtonInOrderModal("products-section", true);
      $(generateAddOrderProductInput(add_order_modal_props.products)).appendTo("#products-section");
    }
    if ($("#products-section > div").length === 5) {
      $("#add-product-btn").hide();
    }
    setCurrentTotalPriceToOrderModal(add_order_modal_props.data.products);
  });

  $("div#products-section").on("click", (e) => {
    e.preventDefault();
    if (e.target.title === "Delete") {
      const id = e.target.getAttribute("data-delete-id");
      const el = document.querySelector(`div[data-id="${id}"]`);
      el.parentNode.removeChild(el);
      if ($("#products-section > div").length === 1) {
        handleFirstDeleteButtonInOrderModal("products-section");
      }
      if ($("#products-section > div").length < 5) {
        $("#add-product-btn").show();
      }
    }
    setCurrentTotalPriceToOrderModal(add_order_modal_props.data.products);
  });

  $("#cancel-order-modal-btn").on("click", (e) => {
    e.preventDefault();
    removeAddOrderModal();
  });

  $("div#products-section").on("input", (e) => {
    setCurrentTotalPriceToOrderModal(add_order_modal_props.data.products);
  });

  $("#create-order-btn").on("click", async (e) => {
    e.preventDefault();
    const submit = document.querySelector("#create-order-btn");
    const cancelBtn = document.querySelector("#cancel-order-modal-btn");
    cancelBtn.setAttribute("disabled", "");
    setSpinnerToButton(submit);
    const requestedProducts = [];
    let customer = {
      name: $("select#inputCustomerOrder").find(":selected").text(),
      email: $("select#inputCustomerOrder").find(":selected").attr("title"),
    };
    customer = add_order_modal_props.data.customers.find(
      (c) => c.name === customer.name && c.email === customer.email
    )._id;
    $('select[name="Product"]').each(function () {
      requestedProducts.push($(this).find(":selected").text());
    });
    const orderData = {
      customer,
      products: [...requestedProducts].map((rp) => {
        return add_order_modal_props.data.products.find((p) => p.name === rp)._id;
      }),
    };

    const response = await OrdersService.createOrder(orderData);
    removeAddOrderModal();
    if (response.status === STATUS_CODES.CREATED) {
      renderNotification({ message: SUCCESS_MESSAGES["New Order Added"] });
      await renderOrdersPage();
    } else if (response.status === STATUS_CODES.NOT_FOUND || response.status >= STATUS_CODES.INTERNAL_SERVER_ERROR) {
      renderNotification({ message: ERROR_MESSAGES["Order not created"] }, true);
    } else {
      handleApiErrors(response, true);
    }
  });
}

function setCurrentTotalPriceToOrderModal(options) {
  const requestedProducts = [];
  $('select[name="Product"]').each(function () {
    requestedProducts.push($(this).find(":selected").text());
  });
  let prices = 0;
  if (requestedProducts.every(Boolean))
    prices = [...requestedProducts].reduce((a, b) => a + options.find((p) => p.name === b).price, 0);
  $("span#total-price-order-modal").text(`$${prices}`);
}

function handleFirstDeleteButtonInOrderModal(sectionSelector, showButton) {
  if (showButton) {
    $(`#${sectionSelector} > div:nth-of-type(1) button.del-btn-modal`).show();
    $(`#${sectionSelector} > div:nth-of-type(1) > div:first-child`).removeClass("col-md-12");
    $(`#${sectionSelector} > div:nth-of-type(1) > div:first-child`).addClass("col-md-11");
  } else {
    $(`#${sectionSelector} > div:nth-of-type(1) button.del-btn-modal`).hide();
    $(`#${sectionSelector} > div:nth-of-type(1) > div:first-child`).addClass("col-md-12");
    $(`#${sectionSelector} > div:nth-of-type(1) > div:first-child`).removeClass("col-md-11");
  }
}

function generateAddOrderModalBody() {
  return `
    <div style="margin-bottom: 20px">
        ${generateFormSelectInput(add_order_modal_props.customers, add_order_modal_props.data.customers)}
    </div>
    <div id="products-section">
        <label for="products-section" class="form-label">Products</label>
        ${generateAddOrderProductInput(add_order_modal_props.products)}
    </div>
        <div>
            <button id="add-product-btn" class="btn btn-outline-primary form-buttons">Add Product</button>
        </div>
    `;
}

const add_order_modal_props = {
  customers: {
    divClasslist: "col-md-12",
    name: "Customer",
    type: "select",
    classlist: "form-select",
    id: "inputCustomerOrder",
    defaultValue: "Apple",
    options: {
      values: [],
    },
    attributes: `name="Customer"`,
  },
  products: {
    divClasslist: "col-md-11",
    name: "Product",
    type: "select",
    classlist: "form-select",
    id: `${window.crypto.randomUUID()}`,
    defaultValue: "Apple",
    options: {
      values: [],
    },
    attributes: `name="Product"`,
  },
  data: {},
};

function generateAddOrderProductInput(options) {
  const products_options = { ...options, id: window.crypto.randomUUID() };
  return `
    <div style="margin-bottom: 10px; display: flex" data-id="${products_options.id}">
        ${generateFormSelectInputWithoutLabel(products_options)}
        <div class="col-md-1 delete-in-modal">
            <button class="btn btn-link text-danger del-btn-modal" title="Delete" data-delete-id="${
              products_options.id
            }">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    </div>
    `;
}

function removeAddOrderModal() {
  if (!document.querySelector("#add-order-modal")) return;
  document.querySelector("#add-order-modal").parentNode.removeChild(document.querySelector("#add-order-modal"));
  orderModalWrap = null;
  $("body").removeClass("modal-open");
  $("body").removeAttr("style");
  if (document.querySelector(".modal-backdrop")) {
    document.querySelector(".modal-backdrop").parentNode.removeChild(document.querySelector(".modal-backdrop"));
  }
}

function setDataToAddOrderModal(data) {
  add_order_modal_props.data = _.cloneDeep(data);
  add_order_modal_props.customers.options.values = data.customers.map((c) => c.name);
  add_order_modal_props.customers.options.titles = data.customers.map((c) => c.email);
  add_order_modal_props.products.options.values = data.products.map((p) => p.name);
  $("#create-order-form").html(generateAddOrderModalBody());
  setCurrentTotalPriceToOrderModal(add_order_modal_props.data.products);

  $("#add-product-btn").on("click", (e) => {
    e.preventDefault();
    if ($("#products-section > div").length < 5) {
      handleFirstDeleteButtonInOrderModal("products-section", true);
      $(generateAddOrderProductInput(add_order_modal_props.products)).appendTo("#products-section");
    }
    if ($("#products-section > div").length === 5) {
      $("#add-product-btn").hide();
    }
    setCurrentTotalPriceToOrderModal(add_order_modal_props.data.products);
  });

  $("div#products-section").on("click", (e) => {
    e.preventDefault();
    if (e.target.title === "Delete") {
      const id = e.target.getAttribute("data-delete-id");
      const el = document.querySelector(`div[data-id="${id}"]`);
      el.parentNode.removeChild(el);
      if ($("#products-section > div").length === 1) {
        handleFirstDeleteButtonInOrderModal("products-section");
      }
      if ($("#products-section > div").length < 5) {
        $("#add-product-btn").show();
      }
    }
    setCurrentTotalPriceToOrderModal(add_order_modal_props.data.products);
  });
}
