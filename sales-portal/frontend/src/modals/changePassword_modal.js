let changePasswordModalWrap = null;
const changePasswordModalId = "edit-customer-modal";

function renderChangePasswordModal(id, event) {
  event.preventDefault();
  if (changePasswordModalWrap !== null) {
    changePasswordModalWrap.remove();
  }
  changePasswordModalWrap = document.createElement("div");
  changePasswordModalWrap.setAttribute("modal", "");
  changePasswordModalWrap.insertAdjacentHTML(
    "afterbegin",
    `
            <div class="modal show fade" id="${changePasswordModalId}" tabindex="-1">
                <div class="modal-dialog-scrollable modal-dialog show">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Change Password</h5>
                            <button type="button" class="btn-close hover-danger" data-bs-dismiss="modal" aria-label="Close" onClick="removeChangePasswordModal();"></button>
                        </div>
                        <div class="modal-body">
                            <div class="rounded-5">
                              <form class="row g-3 form-margin position-relative" id="change-password-form" oninput="validateChangePasswordForm()">
                                  <div class="mb-3">
                                      <label for="modal-currentPassword" class="form-label">Current Password</label>
                                      <input type="password" class="form-control" id="modal-currentPassword" name="currentPassword" placeholder="Enter current password" autocomplete="off" required oninput="validateCurrentPasswordInModal()">
                                      <div class="invalid-feedback" id="modal-error-currentPassword"></div>
                                  </div>
                                  <div class="mb-3">
                                      <label for="modal-newPassword" class="form-label">New Password</label>
                                      <input type="password" class="form-control" id="modal-newPassword" name="newPassword" placeholder="Enter new password" autocomplete="off" required oninput="validateNewPasswordInModal()">
                                      <div class="invalid-feedback" id="modal-error-newPassword"></div>
                                  </div>
                                  <div class="mb-3">
                                      <label for="modal-confirmNewPassword" class="form-label">Confirm New Password</label>
                                      <input type="password" class="form-control" id="modal-confirmNewPassword" name="confirmNewPassword" placeholder="Confirm new password" autocomplete="off" required oninput="validateConfirmPasswordInModal()">
                                      <div class="invalid-feedback" id="modal-error-confirmNewPassword"></div>
                                  </div>
                              </form>
                            </div>
                        </div>
                        <div class="modal-footer mx-4">
                          <button type="submit" class="btn btn-primary mr-10" id="update-password-btn" disabled onclick="changePassword('${id}');">Update Password</button>
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancel-password-modal-btn" onclick="removeChangePasswordModal();">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
    `
  );
  document.body.prepend(changePasswordModalWrap);

  const changePasswordModal = new bootstrap.Modal(changePasswordModalWrap.querySelector(".modal"));
  changePasswordModal.show();
}

function removeChangePasswordModal() {
  document.querySelector("[modal]").parentNode.removeChild(document.querySelector("[modal]"));
  editProductsModalWrap = null;
  $("body").removeClass("modal-open");
  $("body").removeAttr("style");
  if (document.querySelector(".modal-backdrop")) {
    document.querySelector(".modal-backdrop").parentNode.removeChild(document.querySelector(".modal-backdrop"));
  }
}

async function changePassword(id, button) {
  const oldPassword = document.getElementById("modal-currentPassword").value;
  const newPassword = document.getElementById("modal-newPassword").value;
  renderSpinnerInContainer("#change-password-form");
  const response = await ManagersService.changePassword(id, { oldPassword, newPassword });
  if (!response.status >= STATUS_CODES.INTERNAL_SERVER_ERROR) {
    handleApiErrors(response);
  } else if (!response.data.IsSuccess) {
    renderNotification({ message: response.data.ErrorMessage }, true);
  } else {
    renderNotification({ message: SUCCESS_MESSAGES["Password Successfully Changed"] });
  }
  removeChangePasswordModal();
}

function validateCurrentPasswordInModal() {
  const passwordInput = document.getElementById("modal-currentPassword");
  const passwordError = document.getElementById("modal-error-currentPassword");
  const password = passwordInput.value;
  if (!password || password.length < 8) {
    passwordInput.classList.add("is-invalid");
    passwordError.innerText = "Password can't be less then 8 characters.";
    return false;
  } else {
    passwordInput.classList.remove("is-invalid");
    passwordInput.classList.add("is-valid");
    passwordError.innerText = "";
    return true;
  }
}

function validateNewPasswordInModal() {
  const passwordInput = document.getElementById("modal-newPassword");
  const passwordError = document.getElementById("modal-error-newPassword");
  const password = passwordInput.value;
  if (!password || password.length < 8) {
    passwordInput.classList.add("is-invalid");
    passwordError.innerText = "Password can't be less then 8 characters.";
    return false;
  } else {
    passwordInput.classList.remove("is-invalid");
    passwordInput.classList.add("is-valid");
    passwordError.innerText = "";
    return true;
  }
}

function validateConfirmPasswordInModal() {
  const passwordInput = document.getElementById("modal-newPassword");
  const confirmPasswordInput = document.getElementById("modal-confirmNewPassword");
  const confirmPasswordError = document.getElementById("modal-error-confirmNewPassword");
  const confirmPassword = confirmPasswordInput.value;
  const password = passwordInput.value;
  if (!confirmPassword) {
    confirmPasswordInput.classList.add("is-invalid");
    confirmPasswordError.innerText = "Confirm password is required.";
    return false;
  } else if (confirmPassword !== password) {
    confirmPasswordInput.classList.add("is-invalid");
    confirmPasswordError.innerText = "Passwords do not match.";
    return false;
  } else {
    confirmPasswordInput.classList.remove("is-invalid");
    confirmPasswordInput.classList.add("is-valid");
    confirmPasswordError.innerText = "";
    return true;
  }
}

function validateChangePasswordForm() {
  let isValid = true;
  [validateCurrentPasswordInModal, validateNewPasswordInModal, validateConfirmPasswordInModal].forEach(
    (validationFunc) => {
      if (!validationFunc()) {
        isValid = false;
      }
    }
  );

  const saveButton = $("#update-password-btn");

  if (!isValid) {
    saveButton.prop("disabled", true);
  } else {
    saveButton.prop("disabled", false);
  }
  return isValid;
}
