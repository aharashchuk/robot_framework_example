function renderAddNewCustomerLayout(options = add_new_customer_props) {
  return `
  <div class="shadow-sm p-3 mb-5 bg-body rounded  page-title-margin">
    ${backLink(options.buttons.back.href, "Customers")}
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

const add_new_customer_props = {
  path: "Customers",
  title: "Add New Customer",
  formId: "add-new-customer-form",
  requestOpts: {
    url: ENDPOINTS["Customers"],
    opts: {
      body: "",
      headers: {
        ["Content-Type"]: "application/json",
      },
    },
  },
  inputs: {
    email: {
      divClasslist: "col-md-6",
      name: "Email",
      type: "email",
      classlist: "form-control",
      placeholder: `Enter customer's email`,
      id: "inputEmail",
      errorMessageSelector: "#error-inputEmail",
      errorMessage: VALIDATION_ERROR_MESSAGES["Email"],
      attributes: `name="email"`,
      value: "",
    },
    name: {
      divClasslist: "col-md-6",
      name: "Name",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter customer's name`,
      id: "inputName",
      errorMessageSelector: "#error-inputName",
      errorMessage: VALIDATION_ERROR_MESSAGES["Customer Name"],
      attributes: `name="name"`,
      value: "",
    },
    country: {
      divClasslist: "col-md-6",
      name: "Country",
      type: "select",
      classlist: "form-select",
      id: "inputCountry",
      defaultValue: "USA",
      options: {
        values: ["USA", "Canada", "Belarus", "Ukraine", "Germany", "France", "Great Britain", "Russia"],
      },
      attributes: `name="country"`,
    },
    city: {
      divClasslist: "col-md-6",
      name: "City",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter customer's city`,
      id: "inputCity",
      errorMessageSelector: "#error-inputCity",
      errorMessage: VALIDATION_ERROR_MESSAGES["City"],
      attributes: `name="city"`,
      value: "",
    },
    street: {
      divClasslist: "col-md-6",
      name: "Street",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter customer's street`,
      id: "inputStreet",
      errorMessageSelector: "#error-inputStreet",
      errorMessage: VALIDATION_ERROR_MESSAGES["Street"],
      attributes: `name="street"`,
      value: "",
    },
    house: {
      divClasslist: "col-md-6",
      name: "House",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter customer's house`,
      id: "inputHouse",
      errorMessageSelector: "#error-inputHouse",
      errorMessage: VALIDATION_ERROR_MESSAGES["House"],
      attributes: `name="house"`,
      value: "",
    },
    flat: {
      divClasslist: "col-md-6",
      name: "Flat",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter customer's flat`,
      id: "inputFlat",
      errorMessageSelector: "#error-inputFlat",
      errorMessage: VALIDATION_ERROR_MESSAGES["Flat"],
      attributes: `name="flat"`,
      value: "",
    },
    phone: {
      divClasslist: "col-md-6",
      name: "Phone",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter customer's phone number`,
      id: "inputPhone",
      errorMessageSelector: "#error-inputPhone",
      errorMessage: VALIDATION_ERROR_MESSAGES["Phone"],
      attributes: `name="phone"`,
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
      id: "save-new-customer",
      name: "Save New Customer",
    },
    back: {
      id: "back-to-customers-page",
      name: "Back",
      href: ROUTES.CUSTOMERS,
    },
    clear: {
      id: "clear-inputs",
      name: "Clear all",
    },
  },
};

let newCustomerModel = {};

async function submitNewCustomer(requestOpts) {
  const response = await getDataFromApi(requestOpts);
  return response;
}

function addEventListelersToAddNewCustomerPage(options = add_new_customer_props.inputs) {
  const saveChangesBtn = $(`#${add_new_customer_props.buttons.save.id}`);
  const form = $(`#${add_new_customer_props.formId}`);

  form.on("click", async (e) => {
    e.preventDefault();
    const elementId = e.target.id;
    switch (elementId) {
      case add_new_customer_props.buttons.save.id: {
        const submitButton = document.getElementById(add_new_customer_props.buttons.save.id);
        setSpinnerToButton(submitButton);
        const customer = getDataFromForm(`#${add_new_customer_props.formId}`);
        add_new_customer_props.requestOpts.body = customer;
        try {
          const response = await CustomersService.createCustomer(add_new_customer_props.requestOpts.body);
          if (response.status === STATUS_CODES.CREATED) {
            renderNotification({ message: SUCCESS_MESSAGES["New Customer Added"] });
            setRoute(ROUTES.CUSTOMERS);
          } else if (response.status === STATUS_CODES.UNAUTHORIZED) {
            handleApiErrors(response, true);
          } else if (response.status === STATUS_CODES.CONFLICT) {
            renderNotification({ message: ERROR_MESSAGES["Customer exists"] }, true);
          } else {
            renderNotification({ message: ERROR_MESSAGES["Failed to create customer"] }, true);
          }
        } catch (e) {
          console.error(e);
          renderErrorPage();
        }
        break;
      }

      case add_new_customer_props.buttons.back.id: {
        await renderCustomersPage(CustomerProps);
        break;
      }

      case add_new_customer_props.buttons.clear.id: {
        clearAllInputs(add_new_customer_props.inputs, [saveChangesBtn]);
        break;
      }
    }
  });

  form.on("input", (event) => {
    const elementId = event.target.id;
    switch (elementId) {
      case options.name.id: {
        if (!isValidInput("Customer Name", $(`#${options.name.id}`).val())) {
          showErrorMessageForInput(options.name, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "name", saveChangesBtn, add_new_customer_props.path);
        }
        break;
      }

      case options.email.id: {
        if (!isValidInput("Email", $(`#${options.email.id}`).val())) {
          showErrorMessageForInput(options.email, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "email", saveChangesBtn, add_new_customer_props.path);
        }
        break;
      }

      case options.city.id: {
        if (!isValidInput("City", $(`#${options.city.id}`).val())) {
          showErrorMessageForInput(options.city, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "city", saveChangesBtn, add_new_customer_props.path);
        }
        break;
      }

      case options.street.id: {
        if (!isValidInput("Street", $(`#${options.street.id}`).val())) {
          showErrorMessageForInput(options.street, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "street", saveChangesBtn, add_new_customer_props.path);
        }
        break;
      }

      case options.house.id: {
        if (!isValidInput("House", +$(`#${options.house.id}`).val()) || +$(`#${options.house.id}`).val() === 0) {
          showErrorMessageForInput(options.house, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "house", saveChangesBtn, add_new_customer_props.path);
        }
        break;
      }

      case options.flat.id: {
        if (!isValidInput("Flat", +$(`#${options.flat.id}`).val()) || +$(`#${options.flat.id}`).val() === 0) {
          showErrorMessageForInput(options.flat, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "flat", saveChangesBtn, add_new_customer_props.path);
        }
        break;
      }

      case options.phone.id: {
        if (!isValidInput("Phone", $(`#${options.phone.id}`).val())) {
          showErrorMessageForInput(options.phone, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "phone", saveChangesBtn, add_new_customer_props.path);
        }
        break;
      }

      case options.notes.id: {
        const value = removeLineBreaks($(`#${options.notes.id}`).val());
        if (!isValidInput("Notes", value)) {
          showErrorMessageForInput(options.notes, saveChangesBtn);
        } else {
          hideErrorMessageForInput(options, "notes", saveChangesBtn, add_new_customer_props.path);
        }
        break;
      }
    }
  });
}

function validateNewCustomerInputs(options = add_new_customer_props.inputs) {
  return (
    isValidInput("Notes", $(`#${options.notes.id}`).val()) &&
    (($(`#${options.flat.id}`).val().length && isValidInput("Flat", +$(`#${options.flat.id}`).val())) ||
      +$(`#${options.flat.id}`).val() > 0) &&
    (($(`#${options.house.id}`).val().length && isValidInput("House", +$(`#${options.house.id}`).val())) ||
      +$(`#${options.house.id}`).val() > 0) &&
    $(`#${options.name.id}`).val().length &&
    isValidInput("Customer Name", $(`#${options.name.id}`).val()) &&
    $(`#${options.email.id}`).val().length &&
    isValidInput("Email", $(`#${options.email.id}`).val()) &&
    $(`#${options.street.id}`).val().length &&
    isValidInput("Street", $(`#${options.street.id}`).val()) &&
    $(`#${options.city.id}`).val().length &&
    isValidInput("City", $(`#${options.city.id}`).val()) &&
    $(`#${options.phone.id}`).val().length &&
    isValidInput("Phone", $(`#${options.phone.id}`).val())
  );
}
