function renderOrderDetailsPageLayout(options = Order_Details_Props, order, isReceivingOn = false) {
  return `
    <div class="bg-body p-3" id="order-details-header">
        ${backLink(ROUTES.ORDERS, "Orders")}
        <div id="${PAGE_TITLE_ID}" class="p-horizontal-20">  
            <div class="page-header-flex">
                <h2 class="${options.classlist}">Order Details</h2>
            </div>
                ${generateOrderDetailsHeaderSection(order)}
        </div>
    </div>      
        <div class="d-flex justify-content-between flex-wrap" id="order-details-body">
            ${generateCustomerSection(order)}
            ${generateProductsSection(order, isReceivingOn)}
        </div>
        <div class="mb-5 p-3 rounded bg-body position-relative page-title-margin shadow-sm" id="order-details-tabs-section">
            <div class="d-tabs">        
            ${generateOrderDetailsTabs(order)}
          </div>
        </div>
    </div>`;
}

const notReceivedProductsCheckboxesSelector = 'input[type="checkbox"][name="product"]:not([disabled]):not(#selectAll)';
const selectAllCheckboxSelector = "input#selectAll";
const saveReceivingButtonId = "save-received-products";

const Order_Details_Props = {
  path: "Orders",
  title: "Order Details",
  classlist: "ml-20 fw-bold",
};

const cancel_order_confirmation_opts = {
  title: '<i class="bi bi-x-circle me-2"></i> Cancel Order',
  body: "Are you sure you want to cancel the order?",
  deleteFunction: "changeOrderStatus",
  buttons: {
    success: {
      name: "Yes, Cancel",
      id: "cancel-order-modal-btn",
    },
    cancel: {
      name: "Cancel",
      id: "cancel-confirmation-order-modal-btn",
    },
  },
};

const unsassign_manager_confirmation_opts = {
  title: '<i class="bi bi-person-fill-x me-2 text-danger"></i> Unassign Manager',
  body: "Are you sure you want to unassign manager from order?",
  deleteFunction: "unassignManager",
  buttons: {
    success: {
      name: "Yes, Unassign",
      id: "cancel-order-modal-btn",
    },
    cancel: {
      name: "Cancel",
      id: "cancel-confirmation-order-modal-btn",
    },
  },
};

const process_order_confirmation_opts = {
  title: "Process Order",
  body: "Are you sure you want to process the order? ",
  deleteFunction: "changeOrderStatus",
  buttons: {
    success: {
      name: "Yes, Process",
      id: "process-order-modal-btn",
      class: "btn-primary",
    },
    cancel: {
      name: "Cancel",
      id: "process-confirmation-order-modal-btn",
    },
  },
};

const reopern_order_confirmation_opts = (id) => {
  return {
    title: "Reopen Order",
    body: "Are you sure you want to reopen the order? ",
    deleteFunction: "changeOrderStatus",
    id,
    buttons: {
      success: {
        name: "Yes, Reopen",
        id: "reopen-order-modal-btn",
        class: "btn-primary",
        href: ROUTES.ORDER_DETAILS(id),
      },
      cancel: {
        name: "Cancel",
        id: "reopen-confirmation-order-modal-btn",
      },
    },
  };
};

const reopern_order_on_details_confirmation_opts = (id) => {
  return {
    title: "Reopen Order",
    body: "Are you sure you want to reopen the order? ",
    deleteFunction: "changeOrderStatus",
    id,
    buttons: {
      success: {
        name: "Yes, Reopen",
        id: "reopen-order-modal-btn",
        class: "btn-primary",
      },
      cancel: {
        name: "Cancel",
        id: "reopen-confirmation-order-modal-btn",
      },
    },
  };
};

const edit_order_details_modal_props = {
  customers: {
    divClasslist: "col-md-12",
    name: "Customer",
    type: "select",
    classlist: "form-select",
    id: "inputCustomerOrder",
    defaultValue: "",
    options: {
      values: [],
    },
    attributes: `name="Customer" oninput="editCustomerSelectOnInput()"`,
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

async function changeOrderStatus(status, button, id) {
  const cancelBtn = document.querySelector(".modal-footer-mr button.btn-secondary");
  cancelBtn.setAttribute("disabled", "");
  setSpinnerToButton(button);
  const response = await OrdersService.changeOrderStatus(id && id !== "null" ? id : state.order._id, status);
  removeConfimationModal();
  if (response.status === STATUS_CODES.OK) {
    const orderId = state?.order?._id ?? response.data.Order._id;
    isOnOrderDetails(orderId) ? await renderOrderDetailsPage(orderId) : setRoute(ROUTES.ORDER_DETAILS(orderId));
    renderNotification({ message: SUCCESS_MESSAGES[`Order ${status}`] });
  } else {
    handleApiErrors(response, true);
  }
}

async function unassignManager(orderId, button) {
  setSpinnerToButton(button);
  const response = await OrdersService.unassignManager(orderId);
  removeConfimationModal();
  if (response.status === STATUS_CODES.OK) {
    await showNotificationOnOrderDetailsPage(response, { message: SUCCESS_MESSAGES["Manager Unassigned"] });
  } else {
    renderNotification({ message: response.data.ErrorMessage }, true);
  }
}

function addEventListelersToOrderDetailsPage() {
  // $("#delivery-btn").on("click", (e) => {
  //   e.preventDefault();
  //   if (state.order.delivery) {
  //     renderEditDeliveryPage();
  //   } else {
  //     renderScheduleDeliveryPage();
  //   }
  // });

  $("#order-details-header").on("click", (e) => {
    // e.preventDefault();
    switch (e.target.id) {
      case "cancel-order": {
        renderCancelOrderModal(state.order._id);
        break;
      }
      case "refresh-order": {
        renderOrderDetailsPage(state.order._id);
        break;
      }
      case "process-order": {
        renderProcessOrderModal(state.order._id);
        break;
      }
      case "receive-order": {
        break;
      }
    }
  });

  $("#order-details-body").on("click", async (e) => {
    e.preventDefault();
    switch (e.target.id) {
      case "edit-customer-pencil": {
        await renderEditCustomerModal();
        const pencil = document.querySelector("#edit-customer-pencil");
        if (pencil) {
          pencil.innerHTML = '<i class="bi bi-pencil-fill"></i>';
          pencil.disabled = false;
        }

        break;
      }
      case "edit-products-pencil": {
        await renderEditProductsModal();
        const pencil = document.querySelector("#edit-products-pencil");
        if (pencil) {
          pencil.innerHTML = '<i class="bi bi-pencil-fill"></i>';
          pencil.disabled = false;
        }
        break;
      }
      case "start-receiving-products": {
        await renderReceivingOrderDetailsPage(document.getElementById("start-receiving-products"));
        break;
      }
      case saveReceivingButtonId: {
        const products = getReceivingProducts();
        setSpinnerToButton(document.getElementById(saveReceivingButtonId));
        document.getElementById("cancel-receiving").setAttribute("disabled", "");
        await submitReceivedProducts(state.order._id, products);

        break;
      }
      case "selectAll": {
        setTimeout(() => {
          checkSelectAll();
          handleReceivingSaveButton();
        }, 0);
        break;
      }
      case "cancel-receiving": {
        await renderOrderDetailsPage(state.order._id);
      }
    }

    if (e.target.name === "product") {
      setTimeout(() => {
        const isChecked = $(`#${e.target.id}`).prop("checked");
        $(`#${e.target.id}`).prop("checked", !isChecked);
        handleSelectAllCheckbox();
        handleReceivingSaveButton();
      }, 0);
    }
  });

  $(`#order-details-tabs-section`).on("click", (e) => {
    // e.preventDefault();

    switch (e.target.id) {
      case "delivery-tab": {
        state.activeTab = "delivery";
        break;
      }
      case "history-tab": {
        state.activeTab = "history";
        break;
      }
      case "comments-tab": {
        state.activeTab = "comments";
        break;
      }
    }
  });
}

function checkSelectAll() {
  const selectAllInput = $(selectAllCheckboxSelector);
  let isChecked = selectAllInput.prop("checked");
  selectAllInput.prop("checked", !isChecked);
  $(notReceivedProductsCheckboxesSelector).each(function () {
    $(this).prop("checked", !isChecked);
  });
}

function handleSelectAllCheckbox() {
  let isEveryCheckboxChecked = true;
  $(notReceivedProductsCheckboxesSelector).each(function () {
    const isChecked = $(this).prop("checked");
    if (!isChecked) isEveryCheckboxChecked = false;
  });
  const selectAllInput = $(selectAllCheckboxSelector);
  selectAllInput.prop("checked", isEveryCheckboxChecked);
}

function getReceivingProducts() {
  const products = [];
  $(notReceivedProductsCheckboxesSelector).each(function () {
    if ($(this).prop("checked")) {
      const id = $(this).prop("value");
      products.push(id);
    }
  });
  return products;
}

function handleReceivingSaveButton() {
  const saveButton = $(`#${saveReceivingButtonId}`);
  if ([...$(`input[name="product"]:checked:not([disabled])`)].length) {
    saveButton.prop("disabled", false);
  } else {
    saveButton.prop("disabled", true);
  }
}

const commentsTabOptions = {
  comments: {
    divClasslist: "col-md-12 px-3",
    name: "Comments",
    type: "textarea",
    classList: "form-control",
    placeholder: `Enter a comment`,
    id: "textareaComments",
    errorMessageSelector: "#error-textareaComments",
    errorMessage: VALIDATION_ERROR_MESSAGES["Comments"],
    attributes: `rows="3" name="comments" oninput="orderCommentsTextareaOnInput()"`,
    value: "",
  },
};

function orderCommentsTextareaOnInput() {
  const saveCommentBtn = $("#create-comment-btn");
  const value = removeLineBreaks($(`#textareaComments`).val());
  if (!isValidInput("Comments", value)) {
    showErrorMessage(commentsTabOptions.comments);
    saveCommentBtn.prop("disabled", true);
  } else {
    hideErrorMessage(commentsTabOptions.comments);
    saveCommentBtn.prop("disabled", false);
  }
}

async function saveCommentOnClick() {
  const comment = {
    comment: $("#textareaComments").val().trim(),
  };
  setSpinnerToButton(document.querySelector("#create-comment-btn"));
  showCommentsTabSpinner();
  await submitComment(state.order._id, comment);
}

async function deleteCommentOnClick(element) {
  showCommentsTabSpinner();
  await deleteComment(state.order._id, element.id);
}
