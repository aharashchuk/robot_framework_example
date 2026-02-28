let confirmationModalWrap = null;

function renderConfirmationModal(id, options) {
  if (confirmationModalWrap !== null) {
    confirmationModalWrap.remove();
  }
  confirmationModalWrap = document.createElement("div");
  confirmationModalWrap.setAttribute("modal", "");
  confirmationModalWrap.insertAdjacentHTML(
    "afterbegin",
    `
<div class="modal show fade" tabindex="-1" name="confirmation-modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title d-flex justify-content-start align-items-center">${options.title}</h5>
        <button type="button" class="btn-close hover-danger" data-bs-dismiss="modal" aria-label="Close" onClick="removeConfimationModal()"></button>
      </div>
      <div class="modal-body modal-body-text">
        <p>${options.body}</p>
      </div>
      <div class="modal-footer">
        <div class="modal-footer-mr">
          <button type="submit" class="btn position-relative ${
            options.buttons.success.class ? options.buttons.success.class : "btn-danger"
          } mr-10" 
          onClick="${options.deleteFunction}('${id}', this, '${options.id ?? null}')">${
      options.buttons.success.name
    }</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onClick="removeConfimationModal()">${
            options.buttons.cancel.name
          }</button>
        </div>
      </div>
    </div>
  </div>
</div>
        `
  );

  document.body.prepend(confirmationModalWrap);

  const $confirmationModalWrap = new bootstrap.Modal(confirmationModalWrap.querySelector(".modal"));
  $confirmationModalWrap.show();
}

function removeConfimationModal() {
  document.querySelector("[modal]").parentNode.removeChild(document.querySelector("[modal]"));
  confirmationModalWrap = null;
  $("body").removeClass("modal-open");
  $("body").removeAttr("style");
  if (document.querySelector(".modal-backdrop")) {
    document.querySelector(".modal-backdrop").parentNode.removeChild(document.querySelector(".modal-backdrop"));
  }
}
