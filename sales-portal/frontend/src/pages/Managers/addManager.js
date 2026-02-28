function generateAddManagerPageLayout() {
  return `
<div class="d-flex justify-content-center">
    <div class="shadow-sm p-3 mb-5 bg-body rounded page-title-margin col-md-6">
        ${backLink(ROUTES.MANAGERS, "Managers")}
        <div id="title" class="page-header-title">
            <h2 class="page-title-text">Add New Manager</h2>
        </div>
        <form class="row g-3 form-with-inputs d-flex flex-column align-items-center position-relative" id="add-new-manager-form" oninput="validateAddManagerForm()" autocomplete="off">
            <div>
                <label for="inputUsername" class="form-label">Username</label>
                <input type="text" class="form-control" id="inputUsername" placeholder="Enter username" name="username" value="" oninput="validateUsernameField()" autocomplete="off"> 
                <div class="invalid-feedback" id="error-inputUsername"></div>
            </div>
            <div>
                <label for="inputFirstName" class="form-label">First Name</label>
                <input type="text" class="form-control" id="inputFirstName" placeholder="Enter first name" name="firstName" value="" oninput="validateFirstName()" autocomplete="off"> 
                <div class="invalid-feedback" id="error-inputFirstName"></div>
            </div>
            <div>
                <label for="inputLastName" class="form-label">Last Name</label>
                <input type="text" class="form-control" id="inputLastName" placeholder="Enter last name" name="lastName" value="" oninput="validateLastName()" autocomplete="off"> 
                <div class="invalid-feedback" id="error-inputLastName"></div>
            </div>
            <div>
                <label for="inputPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="inputPassword" placeholder="Enter password" name="password" oninput="validatePassword()" autocomplete="off"> 
                <div class="invalid-feedback" id="error-inputPassword"></div>
            </div>
            <div>
                <label for="inputConfirmPassword" class="form-label">Confirm Password</label>
                <input type="password" class="form-control" id="inputConfirmPassword" placeholder="Confirm password" name="confirmPassword" oninput="validateConfirmPassword()" autocomplete="off"> 
                <div class="invalid-feedback" id="error-inputConfirmPassword"></div>
            </div>
            <div class="form-action-section">
                <button type="submit" id="save-new-manager" class="btn btn-primary form-buttons" onclick="saveNewManager(event)" disabled>Save New Manager</button>
                <button id="clear-inputs" class="btn btn-link clear-btn form-buttons" onclick="clearAddManagerForm(event)">Clear all</button>
            </div>
        </form>
    </div>
</div>
  `;
}

function validateUsernameField() {
  const usernameInput = document.getElementById("inputUsername");
  const usernameError = document.getElementById("error-inputUsername");
  const username = usernameInput.value.trim();
  if (!username) {
    usernameInput.classList.add("is-invalid");
    usernameError.innerText = "Username is required.";
    return false;
  } else {
    usernameInput.classList.remove("is-invalid");
    usernameInput.classList.add("is-valid");
    usernameError.innerText = "";
    return true;
  }
}

function validateFirstName() {
  const firstNameInput = document.getElementById("inputFirstName");
  const firstNameError = document.getElementById("error-inputFirstName");
  const firstName = firstNameInput.value.trim();
  if (!firstName) {
    firstNameInput.classList.add("is-invalid");
    firstNameError.innerText = "First name is required.";
    return false;
  } else {
    firstNameInput.classList.remove("is-invalid");
    firstNameInput.classList.add("is-valid");
    firstNameError.innerText = "";
    return true;
  }
}

function validateLastName() {
  const lastNameInput = document.getElementById("inputLastName");
  const lastNameError = document.getElementById("error-inputLastName");
  const lastName = lastNameInput.value.trim();
  if (!lastName) {
    lastNameInput.classList.add("is-invalid");
    lastNameError.innerText = "Last name is required.";
    return false;
  } else {
    lastNameInput.classList.remove("is-invalid");
    lastNameInput.classList.add("is-valid");
    lastNameError.innerText = "";
    return true;
  }
}

function validatePassword() {
  const passwordInput = document.getElementById("inputPassword");
  const passwordError = document.getElementById("error-inputPassword");
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

function validateConfirmPassword() {
  const passwordInput = document.getElementById("inputPassword");
  const confirmPasswordInput = document.getElementById("inputConfirmPassword");
  const confirmPasswordError = document.getElementById("error-inputConfirmPassword");
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

function validateAddManagerForm() {
  let isValid = true;
  [validateUsernameField, validateFirstName, validateLastName, validatePassword, validateConfirmPassword].forEach(
    (validationFunc) => {
      if (!validationFunc()) {
        isValid = false;
      }
    }
  );

  const saveButton = $("#save-new-manager");

  if (!isValid) {
    saveButton.prop("disabled", true);
  } else {
    saveButton.prop("disabled", false);
  }
  return isValid;
}

function clearAddManagerForm(event) {
  event.preventDefault();
  const confirmPasswordInput = document.getElementById("inputConfirmPassword");
  const passwordInput = document.getElementById("inputPassword");
  const usernameInput = document.getElementById("inputUsername");
  const firstNameInput = document.getElementById("inputFirstName");
  const lastNameInput = document.getElementById("inputLastName");
  [confirmPasswordInput, passwordInput, usernameInput, firstNameInput, lastNameInput].forEach(
    (input) => (input.value = "")
  );
  validateAddManagerForm();
}

async function saveNewManager(event) {
  event.preventDefault();
  if (!validateAddManagerForm()) return;

  const [password, username, firstName, lastName] = [
    document.getElementById("inputPassword"),
    document.getElementById("inputUsername"),
    document.getElementById("inputFirstName"),
    document.getElementById("inputLastName"),
  ].map((input) => input.value);

  const newManager = { username, password, firstName, lastName };
  renderSpinnerInContainer("#add-new-manager-form");
  const response = await ManagersService.createManager(newManager);

  if (response.data.IsSuccess) {
    await renderManagersPage(ManagersProps);
    renderNotification({ message: SUCCESS_MESSAGES["New Manager Added"] });
  } else if (response.status >= STATUS_CODES.INTERNAL_SERVER_ERROR) {
    handleApiErrors(response);
  } else {
    renderNotification({ message: response.data.ErrorMessage });
  }
}
