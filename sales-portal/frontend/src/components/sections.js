function generateCustomerSection(order) {
  return `
    <div class="shadow-sm p-3 mb-5 bg-body rounded page-title-margin s-width position-relative" id="customer-section">
        <div class="section-header">
            <h4 class="modal-title">Customer Details</h4>
            ${
              order.status === "Draft"
                ? generateEditPencilButton({ id: "edit-customer-pencil", title: "Edit Customer" })
                : ""
            }
        </div>
        <div class="p-3">
            ${generateCustomerSectionBody(_.omit(order.customer, "_id"))}
        </div>
        
    </div>`;
}

function generateProductsSection(order, isReceivingOn) {
  return `
            <div class="shadow-sm p-3 mb-5 bg-body rounded  page-title-margin s-width position-relative"  id="products-section">
                <div class="section-header d-flex justify-content-between">
                        <div class="d-flex justify-content-start">
                            <h4 class="modal-title">Requested Products</h4>
                            ${
                              order.status === "Draft"
                                ? generateEditPencilButton({ id: "edit-products-pencil", title: "Edit Products" })
                                : ""
                            }               
                        </div>
                        <div class="d-flex justify-content-end">
                            ${isReceivingOn ? backButton("cancel-receiving", "Cancel", "btn-sm") : ""}
                            ${generateReceiveButton(order, isReceivingOn)}
                        </div>     
                </div>
                ${generateProductsSectionBody(order.products, isReceivingOn)}
            </div>`;
}

function generateOrderDetailsTabs(order) {
  return `
    <ul class="nav nav-tabs" id="order-details-tabs" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link fs-5" id="delivery-tab" data-bs-toggle="tab" data-bs-target="#delivery" type="button" role="tab" aria-controls="delivery" aria-selected="false">Delivery</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fs-5" id="history-tab" data-bs-toggle="tab" data-bs-target="#history" type="button" role="tab" aria-controls="history" aria-selected="false">Order History</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fs-5" id="comments-tab" data-bs-toggle="tab" data-bs-target="#comments" type="button" role="tab" aria-controls="comments" aria-selected="false">Comments</button>
        </li>
    </ul>
    <div class="tab-content" id="order-details-tabs-content">
        <div class="tab-pane fade tab-w" id="delivery" role="tabpanel" aria-labelledby="delivery-tab">${generateOrderDeliveryTabBody(
          order
        )}</div>
        <div class="tab-pane fade mb-2" id="history" role="tabpanel" aria-labelledby="history-tab">${generateOrderHistoryTab(
          order
        )}</div>
        <div class="tab-pane fade" id="comments" role="tabpanel" aria-labelledby="comments-tab">${generateCommentsTab(
          order
        )}</div>
    </div>`;
}

function generateOrderDetailsHeaderSection(order) {
  return `
  <div class="position-relative" id="order-info-container">
    ${generateOrderDetailsInfoBar(order) + generateOrderDetailsStatusBar(order)}
  </div>
  `;
}

function generateOrderDetailsInfoBar(order) {
  return `
  <div class="d-flex justify-content-between flex-wrap">
    <div class="d-flex justify-content-start flex-wrap">
      <div class="d-flex justify-content-start p-horizontal-20 flex-wrap mb-3 align-items-center">
          <span class="strong-details fw-bold">Order number: </span>
          <span class="fst-italic">${order._id}</span>
      </div>
      <div class="d-flex justify-content-start p-horizontal-20 align-items-center flex-wrap mb-3 position-relative">
          <span class="strong-details fw-bold">Assigned Manager: </span>
            <div class="position-relative" id="assigned-manager-container">
              ${
                order.assignedManager?.firstName
                  ? generateEditAssignedManagerSection(order)
                  : '<span class="fst-italic" style="cursor: pointer"><u onclick="renderAssigneManagerModal()">Click to select manager</u></span>'
              }
            </div>
      </div>
    </div>
    <div class="ms-3 mb-3  align-items-center">
      ${generateOrderStatusButton(order)}
    </div>
  </div>
    <div class="d-flex justify-content-between p-horizontal-20 mb-3">
        <div class="d-flext justify-content-start">
            ${generateProcessOrReceiveButton(order)}
            ${generateRefreshOrderButton(order)}
        </div>
    </div>`;
}

function generateOrderStatusButton(order) {
  if (order.status === ORDER_STATUSES.DRAFT || order.status === ORDER_STATUSES.IN_PROCESS) {
    return generateCancelOrderButton();
  } else if (order.status === ORDER_STATUSES.CANCELED) {
    return `<div><button class="btn btn-outline-success btn-sm" id="reopen-order" onclick="renderReopenOrderModal('${order._id}')">Reopen Order</button></div>`;
  } else return "";
}
function generateEditAssignedManagerSection(order) {
  return `
  <div>
    ${createManagerDetailsLink(order.assignedManager)}
    <button class="btn btn-sm" title="Edit Assigned Manager" onclick="renderAssigneManagerModal()"><i class="bi bi-pencil-fill"></i></button>
    <button class="btn btn-sm text-danger" title="Remove Assigned Manager" onclick="renderRemoveAssignedManagerModal('${
      order._id
    }')"><i class="bi bi-x-lg"></i></button>
  </div>
  `;
}

function generateRefreshOrderButton(order) {
  return order.status !== "Draft" || (order.status === "Draft" && !order.delivery)
    ? `<button class="btn btn-link btn-sm" id="refresh-order" style="padding-left: 0">Refresh Order <i class="bi bi-arrow-clockwise"></i></button>`
    : `<button class="btn btn-link btn-sm" id="refresh-order">Refresh Order <i class="bi bi-arrow-clockwise"></i></button>`;
}

function generateCancelOrderButton() {
  return `<div><button class="btn btn-outline-danger btn-sm" id="cancel-order">Cancel Order</button></div>`;
}

function generateProcessOrReceiveButton(order) {
  if (order.status === "Draft" && order.delivery) {
    return '<button class="btn btn-primary btn-sm me-3" id="process-order">Process Order</button>';
  } else return "";
}

function generateReceiveButton(order, isReceivingOn) {
  if (order.status === "In Process" || order.status === "Partially Received") {
    return `<button class="btn btn-primary btn-sm" 
        ${isReceivingOn ? "disabled" : ""}
        id="${isReceivingOn ? "save-received-products" : "start-receiving-products"}">${
      isReceivingOn ? "Save" : "Receive"
    }</button>`;
  } else return "";
}

function generateOrderDetailsStatusBar(order) {
  return `
    <div class="d-flex justify-content-between flex-wrap p-horizontal-20 h-m-width" id="order-status-bar-container">
        <div class="me-2">
            <span class="fw-bold">Order Status</span>
            <br/>
            <span class="text-${order.status === "Canceled" ? "danger" : "primary"}">${order.status}</span>
        </div>
        <div class="me-2">
            <span class="fw-bold">Total Price</span>
            <br/>
            <span class="text-primary">$${order.total_price}</span>
        </div>
        <div class="me-2">
            <span class="fw-bold">Delivery</span>
            <br/>
            <span class="text-primary">${order.delivery ? convertToDate(order.delivery.finalDate) : "-"}</span>
        </div> 
        <div class="me-2">
            <span class="fw-bold">Created On</span>
            <br/>
            <span class="text-primary">${convertToFullDateAndTime(order.createdOn)}</span>
        </div>
    </div>`;
}
function generateSectionEntry(key, value) {
  return `
    <div class="c-details">
        <span class="strong-details fw-bold s-span">${replaceApiToFeKeys[key]}</span>
        <span class="s-span">${orderDetailsValuesMapper(key, value)}</span>
    </div>`;
}

function orderDetailsValuesMapper(key, value) {
  if (dateKeys.includes(key) && value) return convertToDateAndTime(value);
  if (key === "finalDate" && value) return convertToDate(value);
  if (!value) return "-";
  if (key === "total_price" || key === "price") return `$${value}`;
  return value;
}

function generateCustomerSectionBody(customer) {
  return Object.keys(customer)
    .map((key) => generateSectionEntry(key, customer[key]))
    .join("");
}

function generateOrderDetailsHeader() {
  return `
    <div>
        <span class="fw-bold">Order Status</span>
        <br/>
        <span class="text-primary">${data.status}</span>
    </div>`;
}

function generateProductsSectionBody(products, isReceivingOn) {
  if (isReceivingOn) {
    return `
        <div class="form-check d-flex justify-content-end pt-4 pb-1" style="margin-right: 30px">
            <input class="form-check-input me-3 align-items-center" type="checkbox" value="" id="selectAll">
            <label class="form-check-label" for="selectAll">Select All</label>
        </div>
        <div class="accordion section-body mt-2" id="products-accordion-section">
            ${products.map((p, i) => generateProductAccordionWithCheckbox(p, i)).join("")}
        </div>`;
  } else {
    return `
        <div class="accordion section-body mt-2" id="products-accordion-section">
            ${products.map((p, i) => generateProductAccordion(p, i)).join("")}
        </div>`;
  }
}

function generateProductAccordion(product, index) {
  return `
    <div class="">
        <div class="accordion-header d-flex justify-content-between" id="heading${index}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                ${product.name}
            </button>
            <span class="align-items-center d-flex justify-content-start received-label">${
              product.received ? "Received" : "Not Received"
            }</span>
        </div>
        <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}">
            <div class="accordion-body">
                ${generateCustomerSectionBody(_.omit(product, ["_id", "amount", "received"]))}
            </div>
        </div>
    </div>`;
}

function generateProductAccordionWithCheckbox(product, index) {
  return `
    <div class="">
        <div class="accordion-header d-flex justify-content-between" id="heading${index}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                ${product.name}
            </button>
            <div class="ms-1 form-check d-flex justify-content-center received-label align-items-center" style="margin-right: 30px">
                <input class="form-check-input me-3 align-items-center" type="checkbox" value="${
                  product._id
                }" id="check${index}" name="product"
                ${product.received ? "checked disabled" : ""}>
                <label class="form-check-label" for="check${index}">Received</label>
            </div>
        </div>
        <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}">
            <div class="accordion-body">
                ${generateCustomerSectionBody(_.omit(product, ["_id", "amount", "received"]))}
            </div>
        </div>
    </div>`;
}

function generateOrderDeliveryTabBody(order) {
  let result = "";
  if (!order.delivery) {
    const nullDeliveryData = {
      condition: null,
      finalDate: null,
      country: null,
      city: null,
      street: null,
      house: null,
      flat: null,
    };
    result = `
        <div class="mb-4 p-3">
            ${generateCustomerSectionBody(nullDeliveryData)}
        </div>`;
  } else {
    result = `
        <div class="mb-4 p-3">
            ${generateCustomerSectionBody({
              condition: order.delivery.condition,
              finalDate: order.delivery.finalDate,
              ...order.delivery.address,
            })}
        </div>`;
  }
  const header = `<h4 class="ms-3 mt-4 mb-3">Delivery Information</h4>`;
  return header + result + handleDeliveryButton(order);
}

function handleDeliveryButton(order) {
  if (order.delivery && order.status === "Draft") {
    return generateDeliveryButton(order);
  } else if (!order.delivery && order.status === "Draft") {
    return generateDeliveryButton(order);
  } else return "";
}

function generateDeliveryButton(order) {
  const { delivery, _id } = order;
  return `
    <div class="section-footer btn-tab">
    <a href="${
      delivery ? ROUTES.ORDER_EDIT_DELIVERY(_id) : ROUTES.ORDER_SCHEDULE_DELIVERY(_id)
    }" class="btn btn-outline-primary page-title-header page-title-button" id="delivery-btn">${
    delivery ? "Edit" : "Schedule"
  } Delivery</a>
    </div>`;
}

function generateOrderHistoryTab(order) {
  return `
    <h4 class="ms-3 my-4">Order History</h4>
    <div class="his-header py-3 fs-5">
        <span class="his-action"></span>
        <span class="his-col fw-bold">Action</span>
        <span class="his-col fw-bold">Performed By</span>
        <span class="his-col fw-bold">Date & Time</span>
    </div>
    ${generateOrderHistoryBody(order)}
    `;
}

function generateOrderHistoryEntiti(history) {
  return `
    <div class="d-flex justify-content-center">
        <span class="his-action"></span>
        <span class="his-col">${history.status}</span>
        <span class="his-col">${state.order.customer.name}</span>
        <span class="his-col">${convertToDateAndTime(history.changedOn)}</span>
    </div>
    `;
}

function generateOrderHistoryBody(order) {
  return `
    <div id="history-body">
        ${order.history.map((h, i) => generateOrderHistoryRow(order, i)).join("")}
    </div>
    `;
}

function generateOrderHistoryRow(order, index) {
  return `
    <div class="accordion"> 
      <div class="accordion-header his-header border-bottom" id="heading2${index}">
          <button class="accordion-button collapsed his-action" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2${index}" 
          aria-expanded="false" aria-controls="collapse2${index}"></button>
          <span class="his-col">${order.history[index].action ?? "Untracked Action"}</span>
          <span class="his-col">${order.history[index].performer.firstName} ${
    order.history[index].performer.lastName
  }</span>
          <span class="his-col">${convertToDateAndTime(order.history[index].changedOn)}</span>
      </div>
      <div id="collapse2${index}" class="accordion-collapse collapse" aria-labelledby="heading2${index}">
          ${generateOrderHistoryNestedRows(order, index)}
      </div>
    </div>`;
}

function generateOrderHistoryNestedRows(order, index) {
  return `
    <div class="mb-3">
        <div class="d-flex justify-content-around py-3 border-bottom">
            <span class="his-action"></span>
            <span class="fw-bold his-col"></span>
            <span class="fw-bold his-col">Previous</span>
            <span class="fw-bold his-col">Updated</span>
        </div>
            ${
              orderHistoryRowByActionMapper[order.history[index].action]
                ? orderHistoryRowByActionMapper[order.history[index].action](order, index)
                : orderHistoryRowByActionMapper[ORDER_HISTORY_ACTIONS.CREATED](order, index)
            }
    </div>`;
}

const orderHistoryRowByActionMapper = {
  [ORDER_HISTORY_ACTIONS.CREATED]: generateOrderChangedStatusHistoryRows,
  [ORDER_HISTORY_ACTIONS.CANCELED]: generateOrderChangedStatusHistoryRows,
  [ORDER_HISTORY_ACTIONS.PROCESSED]: generateOrderChangedStatusHistoryRows,
  [ORDER_HISTORY_ACTIONS.DELIVERY_SCHEDULED]: generateDeliveryInHistoryRows,
  [ORDER_HISTORY_ACTIONS.DELIVERY_EDITED]: generateDeliveryInHistoryRows,
  [ORDER_HISTORY_ACTIONS.CUSTOMER_CHANGED]: generateOrderChangedCustomerHistoryRows,
  [ORDER_HISTORY_ACTIONS.REQUIRED_PRODUCTS_CHANGED]: generateOrderChangedRequestedProductsHistoryRows,
  [ORDER_HISTORY_ACTIONS.RECEIVED]: generateOrderReceiveProductsHistoryRows,
  [ORDER_HISTORY_ACTIONS.RECEIVED_ALL]: generateOrderReceiveProductsHistoryRows,
  [ORDER_HISTORY_ACTIONS.MANAGER_ASSIGNED]: generateOrderChangedManagerHistoryRows,
  [ORDER_HISTORY_ACTIONS.MANAGER_UNASSIGNED]: generateOrderChangedManagerHistoryRows,
  [ORDER_HISTORY_ACTIONS.REOPENED]: generateOrderChangedStatusHistoryRows,
};

function generateDeliveryInHistoryRows(order, index) {
  let previous = index === order.history.length - 1 ? null : order.history[index + 1];
  let updated = order.history[index];
  return `
        <div class="d-flex justify-content-around py-3 border-bottom">
            <span class="his-action"></span>
            <span class="his-col his-nested-row fst-italic">${replaceApiToFeKeys["condition"]}</span>
            <span class="his-col fst-italic">${previous?.delivery ? previous.delivery.condition : "-"}</span>
            <span class="his-col fst-italic">${updated?.delivery ? updated.delivery.condition : "-"}</span>
        </div>
        <div class="d-flex justify-content-around py-3 border-bottom">
            <span class="his-action"></span>
            <span class="his-col his-nested-row fst-italic">${replaceApiToFeKeys["finalDate"]}</span>
            <span class="his-col fst-italic">${
              previous?.delivery ? convertToDate(previous.delivery.finalDate) : "-"
            }</span>
            <span class="his-col fst-italic">${
              updated.delivery ? convertToDate(updated.delivery.finalDate) : "-"
            }</span>
        </div>
        <div class="d-flex justify-content-around py-3 border-bottom">
            <span class="his-action"></span>
            <span class="his-col his-nested-row fst-italic">${replaceApiToFeKeys["country"]}</span>
            <span class="his-col fst-italic">${previous?.delivery ? previous.delivery.address.country : "-"}</span>
            <span class="his-col fst-italic">${updated.delivery ? updated.delivery.address.country : "-"}</span>
        </div>
        <div class="d-flex justify-content-around py-3 border-bottom">
            <span class="his-action"></span>
            <span class="his-col his-nested-row fst-italic">${replaceApiToFeKeys["city"]}</span>
            <span class="his-col fst-italic">${previous?.delivery ? previous.delivery.address.city : "-"}</span>
            <span class="his-col fst-italic">${updated.delivery ? updated.delivery.address.city : "-"}</span>
        </div>
        <div class="d-flex justify-content-around py-3 border-bottom">
            <span class="his-action"></span>
            <span class="his-col his-nested-row fst-italic">${replaceApiToFeKeys["street"]}</span>
            <span class="his-col fst-italic">${previous?.delivery ? previous.delivery.address.street : "-"}</span>
            <span class="his-col fst-italic">${updated.delivery ? updated.delivery.address.street : "-"}</span>
        </div>
        <div class="d-flex justify-content-around py-3 border-bottom">
            <span class="his-action"></span>
            <span class="his-col his-nested-row fst-italic">${replaceApiToFeKeys["house"]}</span>
            <span class="his-col fst-italic">${previous?.delivery ? previous.delivery.address.house : "-"}</span>
            <span class="his-col fst-italic">${updated.delivery ? updated.delivery.address.house : "-"}</span>
        </div>
        <div class="d-flex justify-content-around py-3 border-bottom">
            <span class="his-action"></span>
            <span class="his-col his-nested-row fst-italic">${replaceApiToFeKeys["flat"]}</span>
            <span class="his-col fst-italic">${previous?.delivery ? previous.delivery.address.flat : "-"}</span>
            <span class="his-col fst-italic">${updated.delivery ? updated.delivery.address.flat : "-"}</span>
        </div>
    `;
}

function generateOrderChangedStatusHistoryRows(order, index) {
  let previous = index === order.history.length - 1 ? null : order.history[index + 1];
  let updated = order.history[index];
  return `
    <div class="d-flex justify-content-around py-3 border-bottom">
        <span class="his-action"></span>
        <span class="his-col his-nested-row fst-italic">${replaceApiToFeKeys["status"]}</span>
        <span class="his-col fst-italic">${previous ? previous.status : "-"}</span>
        <span class="his-col fst-italic">${updated.status}</span>
    </div>`;
}

function generateOrderChangedManagerHistoryRows(order, index) {
  let previous = index === order.history.length - 1 ? null : order.history[index + 1];
  let updated = order.history[index];
  return `
    <div class="d-flex justify-content-around py-3 border-bottom">
        <span class="his-action"></span>
        <span class="his-col his-nested-row fst-italic">${replaceApiToFeKeys["assignedManager"]}</span>
        <span class="his-col fst-italic">${
          previous && previous.assignedManager ? convertAssignedManagerToUI(previous.assignedManager) : "Not assigned"
        }</span>
        <span class="his-col fst-italic">${
          updated.assignedManager ? convertAssignedManagerToUI(updated.assignedManager) : "Not assigned"
        }</span>
    </div>`;
}

function generateOrderChangedCustomerHistoryRows(order, index) {
  let previous = index === order.history.length - 1 ? null : order.history[index + 1];
  let updated = order.history[index];
  return `
        <div class="d-flex justify-content-around py-3 border-bottom">
            <span class="his-action"></span>
            <span class="his-col his-nested-row fst-italic">${replaceApiToFeKeys["customer"]}</span>
            <span class="his-col fst-italic">${
              previous ? state.customers.find((c) => c._id === previous.customer).name : "-"
            }</span>
            <span class="his-col fst-italic">${state.customers.find((c) => c._id === updated.customer).name}</span>
        </div>`;
}

function generateOrderChangedRequestedProductsHistoryRows(order, index) {
  let previous = index === order.history.length - 1 ? null : order.history[index + 1];
  let updated = order.history[index];
  let result = "";
  let max;
  if (previous && updated) {
    max = Math.max(previous.products.length, updated.products.length);
  } else {
    max = previous?.products?.length || updated.products.length;
  }
  for (let i = 0; i < max; i++) {
    result += `
        <div class="d-flex justify-content-around py-3 border-bottom">
            <span class="his-action"></span>
            <span class="his-col his-nested-row fst-italic">Product ${i + 1}</span>
            <span class="his-col fst-italic">${
              previous && previous.products[i] ? previous.products[i].name : "-"
            }</span>
            <span class="his-col fst-italic">${updated && updated.products[i] ? updated.products[i].name : "-"}</span>
        </div>`;
  }
  return result;
}

function generateOrderReceiveProductsHistoryRows(order, index) {
  let previous = index === order.history.length - 1 ? null : _.cloneDeep(order.history[index + 1]);
  let updated = _.cloneDeep(order.history[index]);
  return updated?.products
    ?.map(
      (u, i) => `
    <div class="d-flex justify-content-around py-3 border-bottom">
        <span class="his-action"></span>
        <span class="his-col his-nested-row fst-italic">${u.name}</span>
        <span class="his-col fst-italic">${previous?.products[i]?.received ? "Received" : "Not received"}</span>
        <span class="his-col fst-italic">${u.received ? "Received" : "Not received"}</span>
    </div>`
    )
    .join("");
}

function generateCommentsTab(order) {
  return `
      <div class="position-relative" id="comments-tab-container">
        <h4 class="ms-3 my-4">Comments</h4>
        <div class="py-3 fs-5">
            ${generateTextareaInputWithoutLabel(commentsTabOptions.comments)}
            <div class="my-3 ms-3">
                <button class="btn btn-primary" id="create-comment-btn" onclick="saveCommentOnClick()" disabled>Create</button>
            </div>
        </div>
        ${generateSavedComments(order)}
      </div>
    `;
}

function generateSavedComments(order) {
  return order.comments.reverse().reduce((acc, comment) => acc + generateComment(comment), "");
}

function generateComment(comment) {
  const createdBy = comment.createdBy ?? "AQA User";
  return `
    <div class="shadow-sm rounded mx-3 my-3 p-3 border">
        <div class="d-flex justify-content-between align-items-center">
            <p class="m-0" style="word-break: break-word;">${replaceLineBreaksWithBrTag(comment.text)}</p>
            <div class="d-flex align-items-center">
                <button class="btn btn-link text-danger" title="Delete" name="delete-comment" id="${
                  comment._id
                }" onclick="deleteCommentOnClick(this)">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
        <div class="d-flex justify-content-between mt-2 text-muted small">
            <span class="text-primary">${createdBy}</span>
            <span>${convertToDateAndTime(comment.createdOn)}</span>
        </div>
    </div>
    `;
}

function renderCommentsTab(order) {
  $("#comments").html(generateCommentsTab(order));
}
