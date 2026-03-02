function renderAddNewProductLayout(options = add_new_product_props) {
  return `
  <div class="shadow-sm p-3 mb-5 bg-body rounded  page-title-margin">
    ${backLink(ROUTES.PRODUCTS, "Products")}
    <div id="${PAGE_TITLE_ID}" class="page-header-title">
        ${generatePageTitle(options)}
    </div>
    <form class="row g-3 form-with-inputs" id="${options.formId}">
      ${generateFormInputs(options.inputs)} 
        
        <div class="col-12 form-action-section">
          <div>
              ${saveButton(options.buttons.save.id, options.buttons.save.name)}
          </div>
          <div>
            ${clearInputsButton(options.buttons.clear.id, options.buttons.clear.name)}
              </div>
              </div>
            </form>
            </div>
      `;
}

const add_new_product_props = {
  path: "Products",
  title: "Add New Product",
  formId: "add-new-product-form",
  requestOpts: {
    body: {},
  },
  inputs: {
    name: {
      divClasslist: "col-md-6",
      name: "Name",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter products name`,
      id: "inputName",
      errorMessageSelector: "#error-inputName",
      errorMessage: VALIDATION_ERROR_MESSAGES["Product Name"],
      attributes: `name="name"`,
      value: "",
    },
    manufacturer: {
      divClasslist: "col-md-6",
      name: "Manufacturer",
      type: "select",
      classlist: "form-select",
      id: "inputManufacturer",
      defaultValue: "Apple",
      options: {
        values: ["Apple", "Samsung", "Google", "Microsoft", "Sony", "Xiaomi", "Amazon", "Tesla"],
      },
      attributes: `name="manufacturer"`,
    },
    price: {
      divClasslist: "col-md-6",
      name: "Price",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter products price`,
      id: "inputPrice",
      errorMessageSelector: "#error-inputPrice",
      errorMessage: VALIDATION_ERROR_MESSAGES["Price"],
      attributes: `name="price"`,
      value: "",
    },
    amount: {
      divClasslist: "col-md-6",
      name: "Amount",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter product on-hands amount`,
      id: "inputAmount",
      errorMessageSelector: "#error-inputAmount",
      errorMessage: VALIDATION_ERROR_MESSAGES["Amount"],
      attributes: `name="amount"`,
      value: "",
    },
    notes: {
      divClasslist: "col-md-12",
      name: "Notes",
      type: "textarea",
      classList: "form-control",
      placeholder: `Enter notes`,
      id: "textareaNotes",
      errorMessageSelector: "#error-textareaNotes",
      errorMessage: VALIDATION_ERROR_MESSAGES["Notes"],
      attributes: `rows="3" name="notes"`,
      value: "",
    },
  },
  buttons: {
    save: {
      id: "save-new-product",
      name: "Save New Product",
    },
    back: {
      id: "back-to-products-page",
      name: "Back",
    },
    clear: {
      id: "clear-inputs",
      name: "Clear all",
    },
  },
};

function addEventListelersToAddNewProductPage(options = add_new_product_props.inputs) {
  const saveChangesBtn = $(`#${add_new_product_props.buttons.save.id}`);
  const form = $(`#${add_new_product_props.formId}`);

  form.on("click", async (e) => {
    e.preventDefault();
    const elementId = e.target.id;
    switch (elementId) {
      case add_new_product_props.buttons.save.id: {
        const submitButton = document.getElementById(add_new_product_props.buttons.save.id);
        setSpinnerToButton(submitButton);
        const product = getDataFromForm(`#${add_new_product_props.formId}`);
        add_new_product_props.requestOpts.body = product;
        await submitEntiti(add_new_product_props, { message: SUCCESS_MESSAGES["New Product Added"] });
        break;
      }

      case add_new_product_props.buttons.back.id: {
        await renderProductsPage(ProductsProps);
        break;
      }

      case add_new_product_props.buttons.clear.id: {
        clearAllInputs(add_new_product_props.inputs, [saveChangesBtn]);
        break;
      }
    }
  });

  form.on("input", (event) => {
    const elementId = event.target.id;
    switch (elementId) {
      case "inputName": {
        if (!isValidInput("Product Name", $(`#${options.name.id}`).val())) {
          showErrorMessageForInput(options.name, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "name", saveChangesBtn, add_new_product_props.path);
        }
        break;
      }

      case "inputAmount": {
        if (!isValidInput("Amount", +$(`#${options.amount.id}`).val()) || !$(`#${options.amount.id}`).val().length) {
          showErrorMessageForInput(options.amount, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "amount", saveChangesBtn, add_new_product_props.path);
        }
        break;
      }

      case "inputPrice": {
        if (!isValidInput("Price", +$(`#${options.price.id}`).val()) || +$(`#${options.price.id}`).val() === 0) {
          showErrorMessageForInput(options.price, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "price", saveChangesBtn, add_new_product_props.path);
        }
        break;
      }

      case "textareaNotes": {
        const value = removeLineBreaks($(`#${options.notes.id}`).val());
        if (!isValidInput("Notes", value)) {
          showErrorMessageForInput(options.notes, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "notes", saveChangesBtn, add_new_product_props.path);
        }
        break;
      }
    }
  });
}

function validateNewProductInputs(options = add_new_product_props.inputs) {
  return (
    isValidInput("Notes", $(`#${options.notes.id}`).val()) &&
    (($(`#${options.price.id}`).val().length && isValidInput("Price", +$(`#${options.price.id}`).val())) ||
      +$(`#${options.price.id}`).val() > 0) &&
    $(`#${options.amount.id}`).val().length &&
    isValidInput("Amount", +$(`#${options.amount.id}`).val()) &&
    $(`#${options.name.id}`).val().length &&
    isValidInput("Product Name", $(`#${options.name.id}`).val())
  );
}
