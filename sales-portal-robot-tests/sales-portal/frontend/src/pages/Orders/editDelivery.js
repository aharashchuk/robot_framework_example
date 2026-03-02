function renderEditDeliveryLayout(order, options = edit_delivery_props) {
  options.title = "Edit Delivery";
  options.formId = "edit-delivery";
  edit_delivery_props.formId = "edit-delivery";

  const customerAddress = {
    country: order.customer.country,
    city: order.customer.city,
    street: order.customer.street,
    house: order.customer.house,
    flat: order.customer.flat,
  };

  order.delivery.location = _.isEqual(customerAddress, order.delivery.address) ? "Home" : "Other";
  order.delivery.finalDate = convertToDate(order.delivery.finalDate);

  return `
    <div class="shadow-sm p-3 mb-5 bg-body rounded form-center position-relative" id="delivery-container">
        <div id="${PAGE_TITLE_ID}" class="page-header-title d-flex justify-content-around">
            <h2 class="fw-bold">${options.title}</h2>
        </div>
        <form class="row g-3 form-with-inputs p-3" id="${options.formId}">
            <div class="d-flex justify-content-between flex-wrap">
                ${generateFormSelectInput({ ...options.inputs.type, defaultValue: order.delivery.condition })}
                ${generateDatePicker()}
            </div> 
            ${
              order.delivery.condition === "Delivery"
                ? generateFormSelectInput({
                    ...options.inputs.delivery_location,
                    defaultValue: order.delivery.location,
                  })
                : generateFormSelectInput({ ...options.inputs.delivery_location })
            }
            <section id="delivery-location-section" class="row g-2 d-flex justify-content-between s-loc-ml">
                ${generateInitialEditDeliverySectionBody(order)}
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

const edit_delivery_props = _.cloneDeep(delivery_props);

function addEventListelersToEditDeliveryPage(order) {
  enableDatePicker();
  const deliverySection = $("section#delivery-location-section");
  const deliveryTypeSelect = $("select#inputType");
  const deliveryLocationSelect = $("select#inputLocation");
  const deliveryLocationContainer = $("#div-inputLocation");
  const saveButton = $(`button#${delivery_props.buttons.save.id}`);
  const cancelButton = $(`button#${delivery_props.buttons.back.id}`);

  if (order.delivery.condition === "Pickup") {
    deliveryLocationContainer.hide();
  }

  if (order.delivery.condition === "Delivery" && order.delivery.location === "Other") {
    $("section#delivery-location-section input").each(function () {
      $(this).prop("readonly", false);
    });
  }
  setUpDateToDatePicker(order.delivery.finalDate);

  saveButton.on("click", async (e) => {
    e.preventDefault();
    const submit = document.querySelector(`button#${delivery_props.buttons.save.id}`);
    const deleteButton = document.getElementById(delivery_props.buttons.back.id);
    deleteButton.setAttribute("disabled", "");
    setSpinnerToButton(submit);
    await submitDelivery(order._id, createDeliveryRequestBody());
  });

  cancelButton.on("click", async (e) => {
    e.preventDefault();
    await renderOrderDetailsPage(order._id);
  });

  $(`#${edit_delivery_props.formId}`).on("change", (e) => {
    if (validateScheduleDeliveryForm() && !isNewDeliveryEqualToState(order)) {
      saveButton.prop("disabled", false);
    } else {
      saveButton.prop("disabled", true);
    }
  });

  $(`#${edit_delivery_props.formId}`).on("input", (e) => {
    setTimeout(() => {
      if (validateScheduleDeliveryForm() && !isNewDeliveryEqualToState(order)) {
        saveButton.prop("disabled", false);
      } else {
        saveButton.prop("disabled", true);
      }
    }, 0);

    switch (e.target.id) {
      case "inputLocation": {
        if (deliveryLocationSelect.val() === "Other" && deliveryTypeSelect.val() === "Delivery") {
          deliverySection.html(generateEditDeliverySectionBody("Other", order));
          $("section#delivery-location-section input").each(function () {
            $(this).prop("readonly", false);
          });
        } else if (deliveryLocationSelect.val() === "Home" && deliveryTypeSelect.val() === "Delivery") {
          deliverySection.html(generateEditDeliverySectionBody("Home", order));
        }
        break;
      }
      case "inputType": {
        if (deliveryTypeSelect.val() === "Delivery") {
          deliveryLocationContainer.show();
          deliverySection.html(generateEditDeliverySectionBody("Home", order));
        } else {
          deliverySection.html(generateEditPickupSectionBody(order));
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

function generateEditDeliverySectionBody(location, order) {
  const inputs = {};
  if (location === "Home") {
    inputs.country = { ...delivery_props.inputs.countryInput, value: order.customer.country };
    inputs.city = { ...delivery_props.inputs.city, value: order.customer.city };
    inputs.street = { ...delivery_props.inputs.street, value: order.customer.street };
    inputs.house = { ...delivery_props.inputs.house, value: order.customer.house };
    inputs.flat = { ...delivery_props.inputs.flat, value: order.customer.flat };
  } else {
    const isOther = order?.delivery?.location === "Other";
    inputs.country = {
      ...delivery_props.inputs.country,
      value: isOther ? order.delivery.address.country : order.customer.country,
    };
    inputs.city = {
      ...delivery_props.inputs.city,
      value: isOther ? order.delivery.address.city : order.customer.city,
    };
    inputs.street = {
      ...delivery_props.inputs.street,
      value: isOther ? order.delivery.address.street : order.customer.street,
    };
    inputs.house = {
      ...delivery_props.inputs.house,
      value: isOther ? order.delivery.address.house : order.customer.house,
    };
    inputs.flat = {
      ...delivery_props.inputs.flat,
      value: isOther ? order.delivery.address.flat : order.customer.flat,
    };
  }
  return generateFormInputs(inputs);
}

function generateEditPickupSectionBody(order) {
  const pickupCountry = order.delivery.condition === "Pickup" ? order.delivery.address.country : null;
  const inputs = {
    country: {
      ...delivery_props.inputs.country,
      value: pickupCountry ? order.delivery.address.country : order.customer.country,
    },
    city: {
      ...delivery_props.inputs.city,
      value: shopAddressByCountry[pickupCountry || order.customer.country].city,
    },
    street: {
      ...delivery_props.inputs.street,
      value: shopAddressByCountry[pickupCountry || order.customer.country].street,
    },
    house: {
      ...delivery_props.inputs.house,
      value: shopAddressByCountry[pickupCountry || order.customer.country].house,
    },
    flat: {
      ...delivery_props.inputs.flat,
      value: shopAddressByCountry[pickupCountry || order.customer.country].flat,
    },
  };
  return generateFormInputs(inputs);
}

function generateInitialEditDeliverySectionBody(order) {
  if (order.delivery.condition === "Delivery") {
    return generateEditDeliverySectionBody(order.delivery.location, order);
  } else {
    return generateEditPickupSectionBody(order);
  }
}

function isNewDeliveryEqualToState(order) {
  const delivery = _.omit(createDeliveryRequestBody(), "_id").delivery;
  return _.isEqual(delivery, _.omit(order.delivery, "location"));
}
