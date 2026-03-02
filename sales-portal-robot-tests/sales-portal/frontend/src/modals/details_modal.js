let modalWrap = null;
//TODO: Create generateModalLayout and generateModalRaws functions
function createDetailsModal(options = {}, data = {}) {
  if (modalWrap !== null) {
    modalWrap.remove();
  }
  if (!_.isEmpty(data)) {
    data[options.path]["createdOn"] = data[options.path]["createdOn"]
      ? convertToFullDateAndTime(data[options.path]["createdOn"])
      : "";
  }
  modalWrap = document.createElement("div");
  modalWrap.id = `${options.path}-details-modal-id`;
  modalWrap.setAttribute("modal", "");
  modalWrap.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="modal show fade" id="${options.path}DetailsModal" tabindex="-1">
  <div class="modal-dialog-scrollable modal-dialog show">
    <div class="modal-content position-relative" id="details-modal-container">
      <div class="modal-header">
        <h5 class="modal-title d-flex justify-content-start align-items-center">${
          detailsTitleIcon[options.path] ?? '<i class="bi bi-box-seam me-2"></i>'
        } ${data[options.path].name}'s Details</h5>
        <button type="button" class="btn-close hover-danger" data-bs-dismiss="modal" aria-label="Close" onClick="removeDetailsModal();"></button>
      </div>
      <div class="modal-body">

        <div class="rounded-5">
          <section section class="w-100 p-4" id="details-modal-body-container">
            ${generateModalBody(options, data)}
          </section>
        </div>
          
      </div>
      <div class="modal-footer">
        <a href="${options.buttons.edit.href}" type="button" class="btn btn-primary mr-10">Edit ${options.path}</a>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onClick="removeDetailsModal();">Cancel</button>
      </div>
    </div>
  </div>
</div>
    `
  );
  document.body.prepend(modalWrap);

  const customersModal = new bootstrap.Modal(modalWrap.querySelector(".modal"));
  customersModal.show();
}

function generateModalBody(options, data) {
  const modalBody = Object.keys(_.omit(data[options.path], "_id", "__v")).map((key) => {
    return key === "createdOn"
      ? `      
        <div class="details mb-3">
          <h6 class="d-flex align-items-top">
            ${detailsIconsMapper[key] ?? ""}
            <strong class="strong-details">${replaceApiToFeKeys[key]}:</strong>
          </h6>
          <p class="ms-4" style="word-wrap: break-word; white-space: pre-wrap; max-width: 100%; overflow-wrap: break-word;">${
            data[options.path][key] ? convertToFullDateAndTime(data[options.path][key]) : "-"
          }</p>
        </div>
`
      : `   
        <div class="details mb-3">
          <h6 class="d-flex align-items-top">
            ${detailsIconsMapper[key] ?? ""}
            <strong class="strong-details">${replaceApiToFeKeys[key]}:</strong>
          </h6>
          <p class="ms-4" style="word-wrap: break-word; white-space: pre-wrap; max-width: 100%; overflow-wrap: break-word;">${
            data[options.path][key].toString() ? replaceBooleanToYesNo(data[options.path][key]) : "-"
          }</p>
        </div>
      `;
  });

  return modalBody.join("");
}

function replaceBooleanToYesNo(value) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  } else return value;
}

function removeDetailsModal() {
  document.querySelector("[modal]").parentNode.removeChild(document.querySelector("[modal]"));
  modalWrap = null;
  $("body").removeClass("modal-open");
  $("body").removeAttr("style");
  if (document.querySelector(".modal-backdrop")) {
    document.querySelector(".modal-backdrop").parentNode.removeChild(document.querySelector(".modal-backdrop"));
  }
}

const detailsIconsMapper = {
  name: '<i class="bi bi-tag-fill me-2 text-primary"></i>',
  amount: '<i class="bi bi-basket-fill me-2 text-primary"></i>',
  price: '<i class="bi bi-currency-dollar me-2 text-primary"></i>',
  manufacturer: '<i class="bi bi-building me-2 text-primary"></i>',
  createdOn: '<i class="bi bi-calendar-check-fill me-2 text-primary"></i>',
  notes: '<i class="bi bi-journal-text me-2 text-primary"></i>',
};

const detailsTitleIcon = {
  Product: '<i class="bi bi-box-seam me-2"></i>',
};

function setDataToProductDetailsModal(options, data) {
  $("#details-modal-body-container").html(generateModalBody(options, data));
  $(".modal-title").html(`${detailsTitleIcon[options.path]} ${data[options.path].name}'s Details`);
}
