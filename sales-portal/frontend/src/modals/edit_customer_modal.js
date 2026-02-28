let editCustomerModalWrap = null;
const editCustomerModalId = "edit-customer-modal";
const editCustomerSelectInput = `#${editCustomerModalId} select#inputCustomerOrder`;
const updateCustomerButtonSelector = `#${editCustomerModalId} #update-customer-btn`;

function createEditCustomerModal(data) {
  if (editCustomerModalWrap !== null) {
    editCustomerModalWrap.remove();
  }
  editCustomerModalWrap = document.createElement("div");
  editCustomerModalWrap.setAttribute("modal", "");
  editCustomerModalWrap.insertAdjacentHTML(
    "afterbegin",
    `
            <div class="modal show fade" id="${editCustomerModalId}" tabindex="-1">
                <div class="modal-dialog-scrollable modal-dialog show">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Customer</h5>
                            <button type="button" class="btn-close hover-danger" data-bs-dismiss="modal" aria-label="Close" onClick="removeEditCustomerModal();"></button>
                        </div>
                        <div class="modal-body">
                            <div class="rounded-5">
                                <form class="row g-3 form-margin" id="edit-customer-form">
                                ${generateEditCustomerModalBody()}
                                </form>
                            </div>
                        </div>
                        <div class="modal-footer mx-4">
                          <button type="submit" class="btn btn-primary mr-10" id="update-customer-btn" disabled>Save</button>
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancel-edit-customer-modal-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
    `
  );
  document.body.prepend(editCustomerModalWrap);

  const ordersModal = new bootstrap.Modal(editCustomerModalWrap.querySelector(".modal"));
  ordersModal.show();

  $("div.modal-footer #update-customer-btn").on("click", async (e) => {
    e.preventDefault();
    let customer = {
      name: $("select#inputCustomerOrder").find(":selected").text(),
      email: $("select#inputCustomerOrder").find(":selected").attr("title"),
    };
    customer = edit_order_details_modal_props.data.find(
      (c) => c.name === customer.name && c.email === customer.email
    )._id;
    const orderData = {
      _id: state.order._id,
      customer,
      products: state.order.products.map((p) => p._id),
    };
    const submit = document.querySelector("div.modal-footer #update-customer-btn");
    setSpinnerToButton(submit);
    try {
      const response = await OrdersService.editOrder(orderData);
      if (response.status === STATUS_CODES.OK) {
        renderNotification({ message: SUCCESS_MESSAGES["Order Successfully Updated"] });
        await renderOrderDetailsPage(orderData._id);
      } else if (response.status === STATUS_CODES.UNAUTHORIZED) {
        handleApiErrors(response, true);
      } else {
        renderNotification({ message: ERROR_MESSAGES["Failed to update customer"] }, true);
      }
    } catch (e) {
      console.error(e);
      renderErrorPage();
    } finally {
      removeEditCustomerModal();
    }
  });

  $("div.modal-footer #cancel-edit-customer-modal-btn").on("click", (e) => {
    e.preventDefault();
    removeEditCustomerModal();
  });
}

function generateEditCustomerModalBody() {
  return `
    <div style="margin-bottom: 20px">
    ${generateFormSelectInput(edit_order_details_modal_props.customers, edit_order_details_modal_props.data)}
    </div>`;
}

function removeEditCustomerModal() {
  document.querySelector("[modal]").parentNode.removeChild(document.querySelector("[modal]"));
  editCustomerModalWrap = null;
  $("body").removeClass("modal-open");
  $("body").removeAttr("style");
  if (document.querySelector(".modal-backdrop")) {
    document.querySelector(".modal-backdrop").parentNode.removeChild(document.querySelector(".modal-backdrop"));
  }
}

function setDataToEditCustomerModal() {
  $("#edit-customer-form").html(generateEditCustomerModalBody());
}

function editCustomerSelectOnInput() {
  const editCustomerSelectInput = "#edit-customer-modal select#inputCustomerOrder";
  const updateCustomerButtonSelector = "#edit-customer-modal #update-customer-btn";
  const email = $(editCustomerSelectInput).find(":selected").attr("title");
  if (email === state.order.customer.email) {
    $(updateCustomerButtonSelector).prop("disabled", true);
  } else {
    $(updateCustomerButtonSelector).prop("disabled", false);
  }
}
