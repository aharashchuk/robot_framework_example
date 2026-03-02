let editProductsModalWrap = null;
const updateProductsButtonSelector = "div#edit-products-modal #update-products-btn";

function createEditProductsModal(data) {
  setProductsToEditProductsModalProps(data);
  if (editProductsModalWrap !== null) {
    editProductsModalWrap.remove();
  }
  editProductsModalWrap = document.createElement("div");
  editProductsModalWrap.setAttribute("modal", "");
  editProductsModalWrap.insertAdjacentHTML(
    "afterbegin",
    `
            <div class="modal show fade" id="edit-products-modal" tabindex="-1">
                <div class="modal-dialog-scrollable modal-dialog show">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Products</h5>
                            <button type="button" class="btn-close hover-danger" data-bs-dismiss="modal" aria-label="Close" onClick="removeEditProductsModal();"></button>
                        </div>
                        <div class="modal-body">
                            <div class="rounded-5">
                                <form class="row g-3 form-margin" id="edit-products-form">
                                  <div id="edit-products-section" class="position-relative">
                                    <label for="edit-products-section" class="form-label">Products</label>
                                    ${generateEditProductsModalBody()}
                                  </div>
                                  <div>
                                      <button id="add-product-btn" class="btn btn-outline-primary form-buttons">Add Product</button>
                                  </div>
                                </form>
                            </div>
                        </div>
                        <div class="modal-footer mx-4 justify-content-between">
                        <div class="me-5">
                            <span class="">Total Price:</span>
                            <span class="text-primary fw-bold" id="total-price-order-modal"></span>
                        </div>
                        <div>
                            <button type="submit" class="btn btn-primary mr-10" id="update-products-btn" disabled>Save</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancel-edit-products-modal-btn">Cancel</button>
                        </div>                          
                    </div>
                    </div>
                </div>
            </div>
    `
  );
  document.body.prepend(editProductsModalWrap);

  const ordersModal = new bootstrap.Modal(editProductsModalWrap.querySelector(".modal"));
  ordersModal.show();

  handleInitialEditProductsModalBody();

  $(updateProductsButtonSelector).on("click", async (e) => {
    e.preventDefault();
    const products = [];
    $('select[name="Product"]').each(function () {
      products.push($(this).find(":selected").text());
    });
    const orderData = {
      _id: state.order._id,
      customer: state.order.customer._id,
      products: [...products].map((rp) => {
        return edit_order_details_modal_props.data.find((p) => p.name === rp)._id;
      }),
    };
    const submit = document.querySelector("div#edit-products-modal #update-products-btn");
    setSpinnerToButton(submit);
    try {
      const response = await OrdersService.editOrder(orderData);
      if (response.status === STATUS_CODES.OK) {
        renderNotification({ message: SUCCESS_MESSAGES["Order Successfully Updated"] });
        await renderOrderDetailsPage(orderData._id);
      } else if (response.status === STATUS_CODES.UNAUTHORIZED) {
        handleApiErrors(response, true);
      } else {
        renderNotification({ message: ERROR_MESSAGES["Failed to update products"] }, true);
      }
    } catch (e) {
      console.error(e);
      renderErrorPage();
    } finally {
      removeEditProductsModal();
    }
  });

  $("div.modal-footer #cancel-edit-products-modal-btn").on("click", (e) => {
    e.preventDefault();
    removeEditProductsModal();
  });

  $("button#add-product-btn").on("click", (e) => {
    e.preventDefault();
    if ($("#edit-products-section > div").length < 5) {
      handleFirstDeleteButtonInOrderModal("edit-products-section", true);
      $(generateAddOrderProductInput(edit_order_details_modal_props.products)).appendTo("#edit-products-section");
    }
    if ($("#edit-products-section > div").length === 5) {
      $("#add-product-btn").hide();
    }
    setCurrentTotalPriceToOrderModal(edit_order_details_modal_props.data);
    handleSaveButtonAvailabilityInChangeProductsModal();
  });

  $("div#edit-products-section").on("click", (e) => {
    e.preventDefault();
    if (e.target.title === "Delete") {
      const id = e.target.getAttribute("data-delete-id");
      const el = document.querySelector(`div[data-id="${id}"]`);
      el.parentNode.removeChild(el);
      if ($("#edit-products-section > div").length === 1) {
        handleFirstDeleteButtonInOrderModal("edit-products-section");
      }
      if ($("#edit-products-section > div").length < 5) {
        $("#add-product-btn").show();
      }
    }
    handleSaveButtonAvailabilityInChangeProductsModal();
    setCurrentTotalPriceToOrderModal(edit_order_details_modal_props.data);
  });

  $("div#edit-products-section").on("input", (e) => {
    e.preventDefault();
    setCurrentTotalPriceToOrderModal(edit_order_details_modal_props.data);
    handleSaveButtonAvailabilityInChangeProductsModal();
  });
}

function generateEditProductsModalBody() {
  return state.order.products
    .map((p) => generateAddOrderProductInput({ ...edit_order_details_modal_props.products, defaultValue: p.name }))
    .join("");
}

function removeEditProductsModal() {
  document.querySelector("[modal]").parentNode.removeChild(document.querySelector("[modal]"));
  editProductsModalWrap = null;
  $("body").removeClass("modal-open");
  $("body").removeAttr("style");
  if (document.querySelector(".modal-backdrop")) {
    document.querySelector(".modal-backdrop").parentNode.removeChild(document.querySelector(".modal-backdrop"));
  }
}

function handleInitialEditProductsModalBody() {
  setCurrentTotalPriceToOrderModal(edit_order_details_modal_props.data);
  if (state.order.products.length === 5) $("#add-product-btn").hide();
  if (state.order.products.length === 1) handleFirstDeleteButtonInOrderModal("edit-products-section");
}

function handleSaveButtonAvailabilityInChangeProductsModal() {
  const changedProducts = [];
  $('select[name="Product"]').each(function () {
    changedProducts.push($(this).find(":selected").text());
  });
  const selectedProducts = state.order.products.map((p) => p.name);
  const isEqualProductsArrays = _.isEqual(sortStrings(changedProducts), sortStrings(selectedProducts));
  if (isEqualProductsArrays) {
    $(updateProductsButtonSelector).prop("disabled", true);
  } else {
    $(updateProductsButtonSelector).prop("disabled", false);
  }
}

function setProductsToEditProductsModalProps(products) {
  edit_order_details_modal_props.data = _.cloneDeep(products);
  edit_order_details_modal_props.products.options.values = edit_order_details_modal_props.data.map((c) => c.name);
}

function setDataToEditProductsModal(products) {
  setProductsToEditProductsModalProps(products);
  const html = `
    <label for="edit-products-section" class="form-label">Products</label>
    ${generateEditProductsModalBody()}
  `;
  $("#edit-products-section").html(html);
}
