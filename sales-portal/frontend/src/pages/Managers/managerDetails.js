function generateManagerDetailsPageLayout(user, orders) {
  const performer = JSON.parse(window.localStorage.getItem("user"));
  return `
<div class="card shadow-sm p-4 mb-5 bg-body rounded page-title-margin position-relative" id="manager-info-container">
    <div class="back-link" onclick="renderManagersPage();">
        <i class="bi bi-arrow-left me-2"></i> Managers
    </div>
    <div class="card-body" style="margin: 0 12px 0 12px;">
            <div class="card-title mb-4 d-flex justify-content-start align-items-center">
                <h3>Manager Details</h3>
                ${
                  validateUserToEdit(user, performer) && false
                    ? `<button class="btn edit-pencil" id="edit-manager-pencil" title="Edit Manager" 
                onclick="renderEditManagerPage(event,'${user._id}')">
                    <i class="bi bi-pencil-fill"></i>
                </button>`
                    : ""
                }
                ${
                  validateUserToEdit(user, performer) && !user.roles.includes(ROLES.ADMIN)
                    ? `<button class="btn btn-secondary ms-2 btn-sm" id="change-password-button" title="Change Password" onclick="createChangePasswordModal('${user._id}',event)">
                    <i class="bi bi-key-fill"></i> Change Password
                </button>`
                    : ""
                }
                ${
                  validateUserToEdit(user, performer) && !user.roles.includes(ROLES.ADMIN)
                    ? `<button class="btn btn-danger btn-sm ms-3" id="delete-manager" onclick="renderDeleteManagerModal('${user._id}');">Delete</button>`
                    : ""
                }
            </div>      
        <div class="row g-4">
            <div class="col-md-6">
                <h5 class="d-flex align-items-center"><i class="bi bi-person-circle me-1"></i> Username</h5>
                <p id="manager-username">${user.username}</p>

                <h5 class="d-flex align-items-center"><i class="bi bi-person-square me-1"></i> First Name</h5>
                <p id="manager-firstname">${user.firstName}</p>

                <h5 class="d-flex align-items-center"><i class="bi bi-person-lines-fill me-1"></i> Last Name</h5>
                <p id="manager-lastname">${user.lastName}</p>

                <h5 class="d-flex align-items-center"><i class="bi bi-person-badge-fill me-1"></i> Roles</h5>
                <p id="manager-roles">${user.roles.length > 1 ? roles.join(", ") : user.roles[0]}</p>
            </div>
        </div>

        <div class="row g-4 mt-1">
            <div class="col-md-12">
                <h5 class="d-flex align-items-center"><i class="bi bi-calendar-check me-1"></i> Created On</h5>
                <p id="manager-created-on">${convertToFullDateAndTime(user.createdOn)}</p>
            </div>
        </div>
    </div>
</div>

<div class="card shadow-sm p-4 mb-5 bg-body rounded page-title-margin position-relative" id="manager-orders-container">
    <div class="card-body">
        <h3 class="card-title">Assigned Orders</h3>
        <div class="table-responsive">
            <table class="table table-striped tableWrapper" id="table-orders" name="table-with-no-actions" style="table-layout: fixed; width: 100%;">
                <thead>
                    <tr>
                        ${["Order Number", "Price", "Status", "Created On", "Last Modified"]
                          .map((title) => createManagerDetailsTh(title))
                          .join("")}
                    </tr>
                </thead>
                <tbody>
                  ${orders.length ? orders.map((o) => customerOrderRow(o)).join("") : emptyOrdersTableRow()}
                </tbody>
            </table>
        </div>
    </div>
</div>
    `;
}

function createManagerDetailsTh(title) {
  return `
    <th scope="col" style="text-align: left;"><div class="d-flex justify-content-start align-items-center">
      <div class="sp_break-wrap">${title}</div>
    </th>
  `;
}

function renderEditManagerPage(event, managerId) {
  event.preventDefault();
}

function renderChangePasswordPage(event, managerId) {
  event.preventDefault();
}

function validateUserToEdit(user, performer) {
  return user._id === performer._id || performer.roles.includes(ROLES.ADMIN);
}

const delete_manager_confirmation_opts = {
  title: '<i class="bi bi-trash me-2"></i> Delete Manager',
  body: "Are you sure you want to delete manager?",
  deleteFunction: "deleteManager",
  buttons: {
    success: {
      name: "Yes, Delete",
      id: "delete-manager-modal-btn",
    },
    cancel: {
      name: "Cancel",
      id: "cancel-manager-modal-btn",
    },
  },
};

async function deleteManager(id, confirmButton) {
  setSpinnerToButton(confirmButton);
  $('[name="confirmation-modal"] button.btn-secondary').prop("disabled", true);
  confirmButton.innerHTML = buttonSpinner;
  const response = await ManagersService.deleteManager(id);
  removeConfimationModal();

  const manager = JSON.parse(window.localStorage.getItem("user"));
  if (manager._id === id && !manager.roles.includes(ROLES.ADMIN)) {
    await signOutHandler();
  } else {
    await showNotificationAfterDeleteRequest(
      response,
      { message: SUCCESS_MESSAGES["Manager Successfully Updated"]("Manager") },
      ManagersProps
    );
    if (response.data.IsSuccess) {
      await renderManagersPage();
    }
  }
}
