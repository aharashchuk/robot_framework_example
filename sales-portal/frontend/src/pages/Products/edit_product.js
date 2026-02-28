function renderEditProductLayout(options = edit_product_props, data = {}) {
  edit_product_props.id = data._id;
  options.inputs.name.value = data.name;
  options.inputs.manufacturer.value = data.manufacturer;
  options.inputs.price.value = data.price;
  options.inputs.amount.value = data.amount;
  options.inputs.notes.value = data.notes ? data.notes : "";
  currentProductstate = data;
  currentProductstate.notes = data.notes ? data.notes : "";

  return `
    <div class="shadow-sm p-3 mb-5 bg-body rounded  page-title-margin position-relative" id="edit-product-container">
    ${backLink(ROUTES.PRODUCTS, "Products")}
    <div id="${PAGE_TITLE_ID}" class="page-header-title">
      ${generatePageTitle(options, data.name)}
    </div>
    <form class="row g-3 form-with-inputs" id="${options.formId}">
        ${generateFormInputs(options.inputs)}
        <div class="col-12" style="margin-top: 50px; display: flex; justify-content: space-between;">
          <div>
            ${saveButton(options.buttons.save.id, options.buttons.save.name)}
          </div>
          <div>
            ${deleteButton(options.buttons.delete.id, options.buttons.delete.name)}
          </div>
        </div>
      </form>
      </div>
      `;
}

const edit_product_props = {
  path: "Products",
  title: "Edit",
  formId: "edit-product-form",
  id: "",
  inputs: {
    ..._.cloneDeep(add_new_product_props.inputs),
  },
  requestOpts: {
    body: {},
  },
  buttons: {
    save: {
      id: "save-product-changes",
      name: "Save Changes",
    },
    back: {
      id: "back-to-products-page",
      name: "Back",
    },
    delete: {
      id: "delete-product-btn",
      name: "Delete Product",
    },
  },
};

let currentProductstate = {};

function addListenersToEditProductPage(options = edit_product_props.inputs) {
  const saveChangesBtn = $("#save-product-changes");
  const form = $(`#${edit_product_props.formId}`);

  form.on("click", async (e) => {
    e.preventDefault();
    const elementId = e.target.id;
    switch (elementId) {
      case "save-product-changes": {
        const submitButton = document.getElementById(edit_product_props.buttons.save.id);
        const deleteButton = document.getElementById(edit_product_props.buttons.delete.id);
        deleteButton.setAttribute("disabled", "");
        setSpinnerToButton(submitButton);
        const product = getDataFromForm("#edit-product-form");
        edit_product_props.requestOpts.body = {
          _id: edit_product_props.id,
          ...product,
        };
        await submitEntiti(edit_product_props, {
          message: SUCCESS_MESSAGES["Product Successfully Updated"]("Product"),
        });
        break;
      }

      case "delete-product-btn": {
        renderDeleteProductModal(edit_product_props.id);
        break;
      }

      case "back-to-products-page": {
        await renderProductsPage(ProductsProps);
      }
    }
  });

  form.on("input", (event) => {
    const elementId = event.target.id;
    switch (elementId) {
      case "inputName": {
        if (!isValidInput("Product Name", $(`#${options.name.id}`).val())) {
          showErrorMessageForInput(options.name, saveChangesBtn);
        } else if (
          _.isEqual(_.omit(currentProductstate, ["_id", "createdOn"]), getDataFromForm("#edit-product-form"))
        ) {
          hideErrorMessageForInput(options, "name", saveChangesBtn, edit_product_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "name", saveChangesBtn, edit_product_props.path);
        }
        break;
      }

      case "inputAmount": {
        if (!isValidInput("Amount", +$(`#${options.amount.id}`).val()) || !$(`#${options.amount.id}`).val().length) {
          showErrorMessageForInput(options.amount, saveChangesBtn);
        } else if (
          _.isEqual(_.omit(currentProductstate, ["_id", "createdOn"]), getDataFromForm("#edit-product-form"))
        ) {
          hideErrorMessageForInput(options, "amount", saveChangesBtn, edit_product_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "amount", saveChangesBtn, edit_product_props.path);
        }
        break;
      }

      case "inputPrice": {
        if (!isValidInput("Price", +$(`#${options.price.id}`).val()) || +$(`#${options.price.id}`).val() === 0) {
          showErrorMessageForInput(options.price, saveChangesBtn);
        } else if (
          _.isEqual(_.omit(currentProductstate, ["_id", "createdOn"]), getDataFromForm("#edit-product-form"))
        ) {
          hideErrorMessageForInput(options, "price", saveChangesBtn, edit_product_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "price", saveChangesBtn, edit_product_props.path);
        }
        break;
      }

      case "textareaNotes": {
        const value = removeLineBreaks($(`#${options.notes.id}`).val());
        if (!isValidInput("Notes", value)) {
          showErrorMessageForInput(options.notes, saveChangesBtn);
        } else if (
          _.isEqual(_.omit(currentProductstate, ["_id", "createdOn"]), getDataFromForm("#edit-product-form"))
        ) {
          hideErrorMessageForInput(options, "notes", saveChangesBtn, edit_product_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "notes", saveChangesBtn, edit_product_props.path);
        }
        break;
      }

      case "inputManufacturer": {
        if (
          _.isEqual(_.omit(currentProductstate, ["_id", "createdOn"]), getDataFromForm("#edit-product-form")) ||
          !isValidForm()
        ) {
          saveChangesBtn.prop("disabled", true);
        } else {
          saveChangesBtn.prop("disabled", false);
        }
        break;
      }
    }
  });
}
