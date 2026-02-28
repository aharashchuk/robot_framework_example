let editManagerModalWrap = null;
const editManagerModalId = "assign-manager-modal";

function createEditManagerModal(managers, currentManagerId) {
  if (editManagerModalWrap !== null) {
    editManagerModalWrap.remove();
  }
  editManagerModalWrap = document.createElement("div");
  editManagerModalWrap.setAttribute("modal", "");
  editManagerModalWrap.insertAdjacentHTML(
    "afterbegin",
    `
      <div class="modal show fade" id="${editManagerModalId}" tabindex="-1">
        <div class="modal-dialog-scrollable modal-dialog show">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${currentManagerId ? "Edit Assigned Manager" : "Assign Manager"}</h5>
              <button type="button" class="btn-close hover-danger" data-bs-dismiss="modal" aria-label="Close" onClick="removeEditManagerModal();"></button>
            </div>
            <div class="position-relative" id="assign-manager-modal-container">
              <div class="modal-body rounded-5">
                <form class="row g-3 form-margin">
                  <input type="text" id="manager-search-input" class="form-control mb-3" placeholder="Search manager...">
                  <ul class="list-group" id="manager-list" style="max-height:300px;overflow-y:auto;"></ul>
                </form>
              </div>
            </div>
            <div class="modal-footer mx-4">
              <button type="button" class="btn btn-primary" id="update-manager-btn" disabled>Save</button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancel-edit-manager-modal-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `
  );
  document.body.prepend(editManagerModalWrap);

  const ordersModal = new bootstrap.Modal(editManagerModalWrap.querySelector(".modal"));
  ordersModal.show();

  // Рендерим список менеджеров
  renderManagerList(managers, currentManagerId);

  // Поиск
  $("#manager-search-input").on("input", function () {
    const searchValue = $(this).val().toLowerCase();
    const filtered = managers.filter(
      (m) =>
        m.firstName.toLowerCase().includes(searchValue) ||
        m.lastName.toLowerCase().includes(searchValue) ||
        m.username.toLowerCase().includes(searchValue)
    );
    renderManagerList(filtered, currentManagerId);
  });

  // Обработка Save
  $("#update-manager-btn").on("click", async function () {
    const selected = $("#manager-list .list-group-item.active").data("managerid");
    if (!selected) return;
    const response = await OrdersService.assignManager(state.order._id, selected);
    if (response.status === STATUS_CODES.OK) {
      renderNotification({ message: SUCCESS_MESSAGES["Manager Assigned"] });
      await renderOrderDetailsPage(state.order._id);
    } else if (response.status === STATUS_CODES.UNAUTHORIZED) {
      handleApiErrors(response, true);
    } else {
      renderNotification({ message: ERROR_MESSAGES["Failed to assign manager"] }, true);
    }
    removeEditManagerModal();
  });

  $("#cancel-edit-manager-modal-btn").on("click", (e) => {
    e.preventDefault();
    removeEditManagerModal();
  });
}

function renderManagerList(managers, currentManagerId) {
  const $list = $("#manager-list");
  $list.empty();
  managers.forEach((m) => {
    $list.append(`
      <li 
        class="list-group-item list-group-item-action ${m._id === currentManagerId ? "active" : ""}" 
        data-managerid="${m._id}"
        style="white-space: pre-line; word-break: break-word; cursor:pointer;"
      >
        ${m.firstName} ${m.lastName} <small class="text-muted">(${m.username})</small>
      </li>
    `);
  });
  // Активировать выбор
  $("#manager-list .list-group-item").on("click", function () {
    $("#manager-list .list-group-item").removeClass("active");
    $(this).addClass("active");
    $("#update-manager-btn").prop("disabled", false);
  });
}

function removeEditManagerModal() {
  if (editManagerModalWrap) {
    editManagerModalWrap.parentNode.removeChild(editManagerModalWrap);
    editManagerModalWrap = null;
  }
  $("body").removeClass("modal-open");
  $("body").removeAttr("style");
  if (document.querySelector(".modal-backdrop")) {
    document.querySelector(".modal-backdrop").parentNode.removeChild(document.querySelector(".modal-backdrop"));
  }
}
