function renderEditCustomerLayout(options = edit_customer_props, data = {}) {
  edit_customer_props.id = data._id;
  options.inputs.email.value = String(data.email);
  options.inputs.name.value = data.name;
  options.inputs.country.value = data.country;
  options.inputs.city.value = data.city;
  options.inputs.street.value = data.street;
  options.inputs.house.value = data.house;
  options.inputs.flat.value = data.flat;
  options.inputs.phone.value = data.phone;
  options.inputs.notes.value = data.notes ? data.notes : "";
  currentCustomerState = data;
  currentCustomerState.notes = data.notes ? data.notes : "";

  return `
    <div class="shadow-sm p-3 mb-5 bg-body rounded  page-title-margin position-relative" id="edit-customer-container">
      ${backLink(ROUTES.CUSTOMERS, "Customers")}
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
// }

const edit_customer_props = {
  path: "Customers",
  title: "Edit",
  formId: "edit-customer-form",
  id: "",
  inputs: {
    ..._.cloneDeep(add_new_customer_props.inputs),
  },
  requestOpts: {
    body: {},
  },
  buttons: {
    save: {
      id: "save-customer-changes",
      name: "Save Changes",
    },
    back: {
      id: "back-to-customers-page",
      name: "Back",
    },
    delete: {
      id: "delete-customer-btn",
      name: "Delete Customer",
    },
  },
};

let currentCustomerState = {};
let EditedCustomerModel = {};

function getEditCustomerInputValues() {
  return {
    id: edit_customer_props.id,
    email: document.getElementById("inputEmail").value.trim(),
    name: document.getElementById("inputName").value.trim(),
    country: document.getElementById("inputCountry").value.trim(),
    city: document.getElementById("inputCity").value.trim(),
    street: document.getElementById("inputStreet").value.trim(),
    house: document.getElementById("inputHouse").value,
    flat: document.getElementById("inputFlat").value,
    phone: document.getElementById("inputPhone").value.trim(),
    note: document.getElementById("textareaNotes").value.trim(),
  };
}

function addListenersToEditCustomerPage(options = edit_customer_props.inputs) {
  const saveChangesBtn = $(`#${edit_customer_props.buttons.save.id}`);
  const form = $(`#${edit_customer_props.formId}`);

  form.on("click", async (e) => {
    e.preventDefault();
    const elementId = e.target.id;
    switch (elementId) {
      case edit_customer_props.buttons.save.id: {
        const submitButton = document.getElementById(edit_customer_props.buttons.save.id);
        const deleteButton = document.getElementById(edit_customer_props.buttons.delete.id);
        deleteButton.setAttribute("disabled", "");
        setSpinnerToButton(submitButton);
        const customer = getDataFromForm(`#${edit_customer_props.formId}`);
        edit_customer_props.requestOpts.body = {
          _id: edit_customer_props.id,
          ...customer,
        };
        await submitEntiti(edit_customer_props, {
          message: SUCCESS_MESSAGES["Customer Successfully Updated"]("Customer"),
        });
        break;
      }

      case edit_customer_props.buttons.delete.id: {
        const id = getEditCustomerInputValues().id;
        renderDeleteCustomerModal(id);
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
        } else if (
          _.isEqual(
            _.omit(currentCustomerState, ["_id", "createdOn"]),
            getDataFromForm(`#${edit_customer_props.formId}`)
          )
        ) {
          hideErrorMessageForInput(options, "name", saveChangesBtn, edit_customer_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "name", saveChangesBtn, edit_customer_props.path);
        }
        break;
      }

      case options.email.id: {
        if (!isValidInput("Email", $(`#${options.email.id}`).val())) {
          showErrorMessageForInput(options.email, saveChangesBtn);
        } else if (
          _.isEqual(
            _.omit(currentCustomerState, ["_id", "createdOn"]),
            getDataFromForm(`#${edit_customer_props.formId}`)
          )
        ) {
          hideErrorMessageForInput(options, "email", saveChangesBtn, edit_customer_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "email", saveChangesBtn, edit_customer_props.path);
        }
        break;
      }

      case options.city.id: {
        if (!isValidInput("City", $(`#${options.city.id}`).val())) {
          showErrorMessageForInput(options.city, saveChangesBtn);
        } else if (
          _.isEqual(
            _.omit(currentCustomerState, ["_id", "createdOn"]),
            getDataFromForm(`#${edit_customer_props.formId}`)
          )
        ) {
          hideErrorMessageForInput(options, "city", saveChangesBtn, edit_customer_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "city", saveChangesBtn, edit_customer_props.path);
        }
        break;
      }

      case options.street.id: {
        if (!isValidInput("Street", $(`#${options.street.id}`).val())) {
          showErrorMessageForInput(options.street, saveChangesBtn);
        } else if (
          _.isEqual(
            _.omit(currentCustomerState, ["_id", "createdOn"]),
            getDataFromForm(`#${edit_customer_props.formId}`)
          )
        ) {
          hideErrorMessageForInput(options, "street", saveChangesBtn, edit_customer_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "street", saveChangesBtn, edit_customer_props.path);
        }
        break;
      }

      case options.house.id: {
        if (!isValidInput("House", +$(`#${options.house.id}`).val()) || +$(`#${options.house.id}`).val() === 0) {
          showErrorMessageForInput(options.house, saveChangesBtn);
        } else if (
          _.isEqual(
            _.omit(currentCustomerState, ["_id", "createdOn"]),
            getDataFromForm(`#${edit_customer_props.formId}`)
          )
        ) {
          hideErrorMessageForInput(options, "house", saveChangesBtn, edit_customer_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "house", saveChangesBtn, edit_customer_props.path);
        }
        break;
      }

      case options.flat.id: {
        if (!isValidInput("Flat", +$(`#${options.flat.id}`).val()) || +$(`#${options.flat.id}`).val() === 0) {
          showErrorMessageForInput(options.flat, saveChangesBtn);
        } else if (
          _.isEqual(
            _.omit(currentCustomerState, ["_id", "createdOn"]),
            getDataFromForm(`#${edit_customer_props.formId}`)
          )
        ) {
          hideErrorMessageForInput(options, "flat", saveChangesBtn, edit_customer_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "flat", saveChangesBtn, edit_customer_props.path);
        }
        break;
      }

      case options.phone.id: {
        if (!isValidInput("Phone", $(`#${options.phone.id}`).val())) {
          showErrorMessageForInput(options.phone, saveChangesBtn);
        } else if (
          _.isEqual(
            _.omit(currentCustomerState, ["_id", "createdOn"]),
            getDataFromForm(`#${edit_customer_props.formId}`)
          )
        ) {
          hideErrorMessageForInput(options, "phone", saveChangesBtn, edit_customer_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "phone", saveChangesBtn, edit_customer_props.path);
        }
        break;
      }

      case options.notes.id: {
        const value = removeLineBreaks($(`#${options.notes.id}`).val());
        if (!isValidInput("Notes", value)) {
          showErrorMessageForInput(options.notes, saveChangesBtn);
        } else if (
          _.isEqual(
            _.omit(currentCustomerState, ["_id", "createdOn"]),
            getDataFromForm(`#${edit_customer_props.formId}`)
          )
        ) {
          hideErrorMessageForInput(options, "notes", saveChangesBtn, edit_customer_props.path);
          saveChangesBtn.prop("disabled", true);
        } else {
          hideErrorMessageForInput(options, "notes", saveChangesBtn, edit_customer_props.path);
        }
        break;
      }

      case options.country.id: {
        if (
          _.isEqual(
            _.omit(currentCustomerState, ["_id", "createdOn"]),
            getDataFromForm(`#${edit_customer_props.formId}`)
          ) ||
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

function validateNewCustomerInputs(options = edit_customer_props.inputs) {
  return (
    isValidInput("Notes", $(`#${options.notes.id}`).val().replaceAll("\n", "")) &&
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
