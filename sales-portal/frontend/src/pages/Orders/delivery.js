function renderScheduleDeliveryLayout(order, options = delivery_props) {
  options.title = "Schedule Delivery";

  return `
    <div class="shadow-sm p-3 mb-5 bg-body rounded form-center position-relative" id="delivery-container">
        <div id="${PAGE_TITLE_ID}" class="page-header-title d-flex justify-content-around">
            <h2 class="fw-bold">${options.title}</h2>
        </div>
        <form class="row g-3 form-with-inputs p-3" id="${options.formId}">
        <div class="d-flex justify-content-between flex-wrap">
          ${generateFormSelectInput(options.inputs.type)}
          ${generateDatePicker()}
        </div>
         
         ${generateFormSelectInput(options.inputs.delivery_location)}
         <section id="delivery-location-section" class="row g-2 d-flex justify-content-between s-loc-ml">
          ${generateDeliverySectionBody("Home", order)}
         </section>
            <div class="col-12  d-flex justify-content-around">
                <div>
                    ${saveButton(options.buttons.save.id, options.buttons.save.name, "sp_mt")}
                    ${generateLinkButton(
                      {
                        ...options.buttons.back,
                        href: ROUTES.ORDER_DETAILS(order._id),
                        classlist: "btn btn-secondary form-buttons sp_mt",
                      },
                      options.buttons.back.id
                    )}
                </div>
            </div>
        </form>
    </div>
    `;
}

const delivery_props = {
  path: "Orders",
  title: "Delivery",
  formId: "schedule-delivery",
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
    type: {
      divClasslist: "col-md-7",
      name: "Delivery Type",
      type: "select",
      classlist: "form-select",
      id: "inputType",
      defaultValue: "Delivery",
      options: {
        values: ["Delivery", "Pickup"],
      },
    },
    delivery_location: {
      divClasslist: "col-md-12",
      name: "Location",
      type: "select",
      classlist: "form-select",
      id: "inputLocation",
      defaultValue: "Home",
      options: {
        values: ["Home", "Other"],
      },
    },
    country: {
      divClasslist: "col-md-12",
      name: "Country",
      type: "select",
      classlist: "form-select",
      id: "selectCountry",
      defaultValue: "USA",
      options: {
        values: [...FILTER_VALUES.customers],
      },
      attributes: `name="country"`,
    },
    countryInput: {
      divClasslist: "col-md-12",
      name: "Country",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter country`,
      id: "inputCountry",
      errorMessageSelector: "#error-inputCountry",
      errorMessage: VALIDATION_ERROR_MESSAGES["City"],
      attributes: `name="country" readonly`,
      value: "",
    },
    city: {
      divClasslist: "col-md-12",
      name: "City",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter city`,
      id: "inputCity",
      errorMessageSelector: "#error-inputCity",
      errorMessage: VALIDATION_ERROR_MESSAGES["City"],
      attributes: `name="city" readonly`,
      value: "",
    },
    street: {
      divClasslist: "col-md-12",
      name: "Street",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter street`,
      id: "inputStreet",
      errorMessageSelector: "#error-inputStreet",
      errorMessage: VALIDATION_ERROR_MESSAGES["Street"],
      attributes: `name="street" readonly`,
      value: "",
    },
    house: {
      divClasslist: "col-md-6",
      name: "House",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter house`,
      id: "inputHouse",
      errorMessageSelector: "#error-inputHouse",
      errorMessage: VALIDATION_ERROR_MESSAGES["House"],
      attributes: `name="house" readonly`,
      value: "",
    },
    flat: {
      divClasslist: "col-md-6",
      name: "Flat",
      type: "text",
      classlist: "form-control",
      placeholder: `Enter flat`,
      id: "inputFlat",
      errorMessageSelector: "#error-inputFlat",
      errorMessage: VALIDATION_ERROR_MESSAGES["Flat"],
      attributes: `name="flat" readonly`,
      value: "",
    },
  },
  buttons: {
    save: {
      id: "save-delivery",
      name: "Save Delivery",
    },
    back: {
      id: "back-to-order-details-page",
      name: "Cancel",
    },
  },
};

const shopAddressByCountry = {
  USA: {
    city: "Jefferson City",
    street: "John Daniel Drive",
    house: 381,
    flat: 2,
  },
  Canada: {
    city: "Halifax",
    street: "Higginsville Road",
    house: 563,
    flat: 24,
  },
  Belarus: {
    city: "Vitebsk",
    street: "Frunze",
    house: 22,
    flat: 20,
  },
  Ukraine: {
    city: "Yalta",
    street: "Leningradskaya",
    house: 55,
    flat: 1,
  },
  Germany: {
    city: "Altendorf",
    street: "Luebecker Strasse",
    house: 41,
    flat: 3,
  },
  France: {
    city: "Le Bouscat",
    street: "boulevard Aristide Briand",
    house: 99,
    flat: 56,
  },
  "Great Britain": {
    city: "Mickletown",
    street: "Winchester Rd",
    house: 20,
    flat: 44,
  },
  Russia: {
    city: "Chelyabinsk",
    street: "Grazhdanskaya",
    house: 14,
    flat: 101,
  },
};

function createDeliveryRequestBody() {
  const delivery = {};
  const data = getDeliveryData(delivery_props.formId);
  delivery.finalDate = data.finalDate;
  delivery.address = _.omit(data, "finalDate");
  delivery.condition = $(`#${delivery_props.inputs.type.id}`).val();
  return delivery;
}

function addEventListelersToScheduleDeliveryPage(order) {
  enableDatePicker();
  const deliverySection = $("section#delivery-location-section");
  const deliveryTypeSelect = $("select#inputType");
  const deliveryLocationSelect = $("select#inputLocation");
  const deliveryLocationContainer = $("#div-inputLocation");
  const saveButton = $(`button#${delivery_props.buttons.save.id}`);
  const cancelButton = $(`button#${delivery_props.buttons.back.id}`);

  saveButton.on("click", async (e) => {
    e.preventDefault();
    const submit = document.querySelector(`button#${delivery_props.buttons.save.id}`);
    setSpinnerToButton(submit);
    const deleteButton = document.getElementById(delivery_props.buttons.back.id);
    deleteButton.setAttribute("disabled", "");
    await submitDelivery(order._id, createDeliveryRequestBody());
  });

  cancelButton.on("click", async (e) => {
    e.preventDefault();
    await renderOrderDetailsPage(order._id);
  });

  $(`#${delivery_props.formId}`).on("change", (e) => {
    if (validateScheduleDeliveryForm()) {
      saveButton.prop("disabled", false);
    } else {
      saveButton.prop("disabled", true);
    }
  });

  $(`#${delivery_props.formId}`).on("input", (e) => {
    setTimeout(() => {
      if (validateScheduleDeliveryForm()) {
        saveButton.prop("disabled", false);
      } else {
        saveButton.prop("disabled", true);
      }
    }, 0);

    switch (e.target.id) {
      case "inputLocation": {
        if (deliveryLocationSelect.val() === "Other" && deliveryTypeSelect.val() === "Delivery") {
          deliverySection.html(generateDeliverySectionBody("Other", order));
          $("section#delivery-location-section input").each(function () {
            $(this).prop("readonly", false);
          });
        } else if (deliveryLocationSelect.val() === "Home" && deliveryTypeSelect.val() === "Delivery") {
          deliverySection.html(generateDeliverySectionBody("Home", order));
        }
        break;
      }
      case "inputType": {
        if (deliveryTypeSelect.val() === "Delivery") {
          deliveryLocationContainer.show();
          deliveryLocationSelect.val("Home");
          deliverySection.html(generateDeliverySectionBody("Home", order));
        } else {
          deliverySection.html(generatePickupSectionBody(order));
          deliveryLocationContainer.hide();
        }
        break;
      }
      case "selectCountry": {
        if (deliveryTypeSelect.val() === "Pickup") {
          setShopAddressByCountry($("select#selectCountry").val());
        }
        break;
      }

      case "inputCity": {
        if (!isValidInput("City", $(`#${delivery_props.inputs.city.id}`).val())) {
          showErrorMessage(delivery_props.inputs.city);
        } else {
          hideErrorMessage(delivery_props.inputs.city);
        }
        break;
      }

      case "inputStreet": {
        if (!isValidInput("Street", $(`#${delivery_props.inputs.street.id}`).val())) {
          showErrorMessage(delivery_props.inputs.street);
        } else {
          hideErrorMessage(delivery_props.inputs.street);
        }
        break;
      }

      case "inputHouse": {
        if (
          !isValidInput("House", +$(`#${delivery_props.inputs.house.id}`).val()) ||
          +$(`#${delivery_props.inputs.house.id}`).val() === 0
        ) {
          showErrorMessage(delivery_props.inputs.house);
        } else {
          hideErrorMessage(delivery_props.inputs.house);
        }
        break;
      }

      case "inputFlat": {
        if (
          !isValidInput("Flat", +$(`#${delivery_props.inputs.flat.id}`).val()) ||
          +$(`#${delivery_props.inputs.flat.id}`).val() === 0
        ) {
          showErrorMessage(delivery_props.inputs.flat);
        } else {
          hideErrorMessage(delivery_props.inputs.flat);
        }
        break;
      }
    }
  });
}

function validateScheduleDeliveryForm() {
  const data = _.omit(getDeliveryData(delivery_props.formId), "country");
  const delivery = Object.keys({ ...data }).reduce((acc, key) => {
    acc[_.capitalize(key)] = data[key];
    return acc;
  }, {});
  let isValid = true;
  for (const key in delivery) {
    if (!isValidInput(key, delivery[key])) {
      isValid = false;
    }
  }
  if ($("input.is-invalid").length) isValid = false;
  return isValid;
}

function getDeliveryData(formId) {
  const delivery = getDataFromForm(`#${formId}`);
  delivery.finalDate = $("#date-input").val();
  return delivery;
}

function setShopAddressByCountry(country) {
  const address = { ...shopAddressByCountry[`${country}`] };
  $(`#${delivery_props.inputs.city.id}`).val(address.city);
  $(`#${delivery_props.inputs.street.id}`).val(address.street);
  $(`#${delivery_props.inputs.house.id}`).val(address.house);
  $(`#${delivery_props.inputs.flat.id}`).val(address.flat);
}

function generateDeliverySectionBody(location, order) {
  const inputs = {
    country:
      location === "Home"
        ? { ...delivery_props.inputs.countryInput, value: order.customer.country }
        : { ...delivery_props.inputs.country, value: order.customer.country },
    city: { ...delivery_props.inputs.city, value: order.customer.city },
    street: { ...delivery_props.inputs.street, value: order.customer.street },
    house: { ...delivery_props.inputs.house, value: order.customer.house },
    flat: { ...delivery_props.inputs.flat, value: order.customer.flat },
  };
  return generateFormInputs(inputs);
}

function generatePickupSectionBody(order) {
  const inputs = {
    country: { ...delivery_props.inputs.country, value: order.customer.country },
    city: { ...delivery_props.inputs.city, value: shopAddressByCountry[order.customer.country].city },
    street: { ...delivery_props.inputs.street, value: shopAddressByCountry[order.customer.country].street },
    house: { ...delivery_props.inputs.house, value: shopAddressByCountry[order.customer.country].house },
    flat: { ...delivery_props.inputs.flat, value: shopAddressByCountry[order.customer.country].flat },
  };
  return generateFormInputs(inputs);
}
