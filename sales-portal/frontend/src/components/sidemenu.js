function generateSidebar(options) {
  const user = JSON.parse(window.localStorage.getItem("user"));
  const layout = `

    <div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style="width: 220px;" id="${SIDEBAR_ID}">
      <a class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none pe-auto" onclick="sideMenuClickHandler('Home')" style="cursor: pointer;">
        <svg class="bi me-2" width="40" height="32"><use xlink:href="#bootstrap"></use></svg>
        <span class="fs-4">${options.navbar.name}</span>
      </a>
      <hr>

       <ul class="nav nav-pills flex-column mb-auto">
      ${generateSidebarItem(options.navbar.items)}
      </ul> 

      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="sp-theme-switch" onclick="switchTheme(null, this)" ${
          getStoredTheme() === "dark" ? "checked" : ""
        }>
        <label class="form-check-label" for="sp-theme-switch">Dark mode</label>
      </div>
      <hr>
      <div class="d-flex justify-content-between">
        <div class="dropdown">
          <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="https://github.com/mdo.png" alt="" width="32" height="32" class="rounded-circle me-2">
            <strong>${user ? user.firstName : "RELOGIN!"}</strong>
          </a>
          <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
            <li><button class="dropdown-item" id="profile" 
            onclick="profileHandler('${user?._id}',event)">Profile</button></li> 
            ${
              user?.roles.includes(ROLES.ADMIN)
                ? ""
                : `          <li><button class="dropdown-item" id="change-password" 
            onclick="changePasswordHandler('${user?._id}',event)">Change Password</button></li>`
            }
            <li><hr class="dropdown-divider"></li> 
            <li><button class="dropdown-item" id="signOut" onclick="signOutHandler()">Sign out</button></li>
          </ul>
        </div>
      <div class="d-flex flex-column align-items-center me-3" style="position: relative;">
        <div class="position-relative d-inline-block" id="notification-bell" style="cursor: pointer;">
          <i class="bi bi-bell fs-4"></i>
          <span id="notification-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: .75rem; display:none"></span>
        </div>
        <!-- Кастомный выпадающий блок уведомлений (по умолчанию скрыт) -->
        <div id="notification-popover"
          class="card shadow bg-dark text-light"
          style="display: none; position: absolute; left: -164px; bottom: 50px; width: 242px; z-index: 999;">
           <div class="position-relative" id="notification-popover-container">  
            <div class="card-header d-flex justify-content-between align-items-center border-0 pb-1 bg-dark" style="border-bottom: 1px solid #343a40 !important;">
              <span class="fw-bold">Notifications</span>
              <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2" id="mark-all-read" style="font-size: 0.85rem;" disabled onclick="markAllNotificationsAsRead(event)">Read All</button>
            </div>
            <ul class="list-group list-group-flush" id="notification-list" style="max-height: 320px; overflow-y: auto;">
              <!-- Notifications will appear here -->
            </ul>
           </div>
        </div>
      </div>

      </div>
    </div>
    `;
  return layout;
}

function generateSidebarItem(items = []) {
  return items
    .map(
      (el, index) => `<li>
    <a href="#/${el.name.toLowerCase()}" class="nav-link ${index === 0 ? "active" : ""} text-white" name="${el.name}" ${
        index === 0 ? 'aria-current="page"' : ""
      } onClick="sideMenuClickHandler('${el.name}');">
      <svg class="bi me-2" width="16" height="16"><use xlink:href="${el.xlink}"></use></svg>
      ${el.name}
    </a>
  </li>`
    )
    .join("");
}

function addEventListenersToSidemenu(options) {
  const currencyInput = $(`#currency-input`);
  const currencyResult = $(`#exchange-result`);
  const currencyButton = $(`#exchange-button`);
  const currencyRate = $(`#currancy-rate`);

  currencyButton.on("click", () => {
    const currencyValue = getFromDatabase();
    const rate = +currencyRate.text().split("$")[1];
    const result = (currencyValue / rate).toFixed(2);
    currencyResult.text(`Result: ${result}`);
    currencyResult.removeClass("d-none");
    clearDataBase();
    currencyInput.val("");
  });

  function writeToDatabase(letter) {
    const scriptDbElement = $("#database")[0];
    const scriptDbElementArray = JSON.parse(scriptDbElement.innerText);
    if (+letter) {
      scriptDbElementArray.push({ num: letter });
      setTimeout(() => {
        $("#database")[0].innerText = JSON.stringify(scriptDbElementArray);
        console.log(`saved to DB: ${letter}`);
      }, getRandomArbitrary(1, 3) * 1000);
    }
  }

  function getFromDatabase() {
    const scriptDbElement = $("#database")[0];
    const dbValue = JSON.parse(scriptDbElement.innerText)
      .map((el) => el.num)
      .join("");
    return +dbValue;
  }

  function clearDataBase() {
    $(`#database`).text("[]");
  }

  currencyInput.keyup(function (e) {
    const key = e.key;
    console.log({ key });
    writeToDatabase(key);
  });

  const bell = document.getElementById("notification-bell");
  const popover = document.getElementById("notification-popover");
  const markAllReadBtn = document.getElementById("mark-all-read");

  // Показать/скрыть popover
  // bell.onclick = async function (e) {
  //   e.stopPropagation();
  //   if (popover.classList.contains("d-none")) {
  //     popover.classList.remove("d-none");
  //     showNotificationPopoverSpinner();
  //     await renderNotifications();
  //   } else {
  //     popover.classList.add("d-none");
  //   }
  //   hideSpinners();
  // };

  // Закрывать popover по клику вне его
  // document.addEventListener("click", (e) => {
  //   if (popover.style.display === "block" && !popover.contains(e.target) && !bell.contains(e.target)) {
  //     popover.style.display = "none";
  //   }
  // });
}

function currencyExchangeSection() {
  return `
        <div class="mb-auto mt-5">
        <label for="currency-input" class="mb-2">Currency exchange</label>
        <label for="currency-input" class="mb-2" id="currancy-rate">Rate: $20.15</label>
        <input type="number" class="form-control" id="currency-input">
        <button class="btn btn-primary mt-2" id='exchange-button'>Buy</button>
        <br>
        <label id="exchange-result" class="mt-2 d-none">Result:</label>
      </div>
  `;
}

async function signOutHandler() {
  setSpinnerToBody();
  const response = await SignInService.signOut();
  if (response.status !== STATUS_CODES.OK) {
    handleApiErrors(response);
    hideSpinners();
    return renderNotification({ message: response.data.ErrorMessage }, true);
  }
  hideSpinners();
  localStorage.removeItem("token");
  removeAuthorizationCookie();
  document.querySelector("#sidemenu").parentNode.removeChild(document.querySelector("#sidemenu"));
  setRoute(ROUTES.SIGNIN);
  state.notifications = {};
}

async function profileHandler(id, event) {
  event.preventDefault();
  id = id ?? JSON.parse(window.localStorage.getItem("user"))?._id;
  if (!id) await signOutHandler();
  setRoute(ROUTES.MANAGER_DETAILS(id));
}

async function changePasswordHandler(id, event) {
  event.preventDefault();
  if (state.page !== PAGES.MANAGER_DETAILS) {
    setRoute(ROUTES.MANAGER_DETAILS(id));
    state.page = PAGES.MANAGER_DETAILS;
  }
  createChangePasswordModal(id, event);
}
