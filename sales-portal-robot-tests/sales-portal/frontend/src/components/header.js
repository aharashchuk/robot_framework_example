function generateHeaderLayout() {
  const user = JSON.parse(window.localStorage.getItem("user"));
  return `
<header class="navbar navbar-expand-lg bg-body border-bottom shadow-sm fixed-top px-3" id="main-header">

  <!-- Бургер СЛЕВА на мобилке -->
  <button class="navbar-toggler d-lg-none me-2" type="button" data-bs-toggle="offcanvas"
          data-bs-target="#mobileOffcanvas" aria-controls="mobileOffcanvas">
    <span class="navbar-toggler-icon"></span>
  </button>

  <!-- Меню (на десктопе слева) -->
  <div class="d-none d-lg-flex align-items-center gap-3">
         <span class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none pe-auto text-body">
           <svg class="bi me-2" width="40" height="32"><use xlink:href="#bootstrap"></use></svg>
           <span class="fs-4">Sales Portal</span>
         </span>
    ${navigationMenuOptions.map(createNavigationMenuItem).join("")}
  </div>

  <!-- Правая часть: справа всегда -->
  <div class="d-flex align-items-center gap-3 ms-auto">

    <!-- Уведомления -->
     <div class="navbar-right me-4">
       <div class="notifications">
         <button id="notification-bell" title="Notifications" class="btn btn-link" onclick="toggleNotificationsModal()">
           <i class="bi bi-bell fs-5"></i>
           <span class="badge" id="notification-badge"></span>
         </button>
       </div>

    <!-- Переключатель темы -->
    <button id="theme-toggle" class="btn btn-link" onclick="switchTheme(null)"><i class="bi bi-moon fs-5"></i></button>

    <!-- Профиль -->
    <div id="user-menu-button">
      <a class="d-flex align-items-center text-body text-decoration-none" href="${ROUTES.MANAGER_DETAILS(user?._id)}">
        <strong>${user?.firstName ?? "User"}</strong>
      </a>

    </div>

    <!-- Логаут -->
    <button class="btn btn-link" title="Sign Out" id="signOut" onclick="signOutHandler()">
      <i class="bi bi-door-open fs-5"></i>
    </button>
  </div>
</header>
<div id="notification-popover" class="card shadow bg-body text-body d-none navbar-right">
  <div class="position-relative" id="notification-popover-container">  
    <div class="card-header d-flex justify-content-between align-items-center border-0 bg-body" style="border-bottom: 1px solid #343a40 !important;">
      <div class="d-flex justify-content-start align-items-center">
        <span class="fw-bold">Notifications</span>
        <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2 ms-2" id="mark-all-read" style="font-size: 0.85rem;" onclick="markAllNotificationsAsRead(event)">Read All</button>
      </div>
        <button type="button" class="btn-close ms-2 mt-1" onclick="toggleNotificationsModal()"></button>
      </div>
    <ul class="list-group list-group-flush" id="notification-list" style="overflow-y: auto;"></ul>
  </div>
</div>

<!-- Off-canvas для мобилки -->
<div class="offcanvas offcanvas-start" tabindex="-1" id="mobileOffcanvas">
  <div class="offcanvas-header">
    <button type="button" class="btn-close ms-2 mt-1" data-bs-dismiss="offcanvas"></button>
  </div>

  <div class="offcanvas-body d-flex flex-column gap-3">
    <!-- Навигация -->
    <nav class="nav flex-column">
      ${navigationMenuOptions
        .map(
          ({ href, text }) =>
            `<div name="module-item">
              <a class="nav-link link-body-emphasis d-flex justify-content-center fs-4" 
                href="${href}" data-bs-dismiss="offcanvas" 
                name="${text.toLowerCase()}" 
                onclick="handleMobileNavigationClick(event, '${href}', '${text.toLowerCase()}')">${text}</a>
             </div>`
        )
        .join("")}
    </nav>
    <hr>
    <!-- Логаут -->
    <button class="btn btn-outline-danger w-100" onclick="signOutHandler()">
      <i class="bi bi-box-arrow-right me-2"></i>Logout
    </button>
  </div>
</div>
`;
}

async function toggleNotificationsModal() {
  const notificationsContainer = document.querySelector("#notification-popover");
  const bell = document.getElementById("notification-bell");

  const rect = bell.getBoundingClientRect();

  notificationsContainer.style.position = "fixed";
  notificationsContainer.style.top = `${rect.bottom + 10}px`; // 10px отступ вниз
  notificationsContainer.style.right = `0px`;
  notificationsContainer.style.zIndex = 1060;
  if (notificationsContainer.classList.contains("d-none")) {
    notificationsContainer.classList.remove("d-none");
    showNotificationPopoverSpinner();
    await renderNotifications();
    hideSpinners();
  } else {
    notificationsContainer.classList.add("d-none");
  }
}

async function clickOnNitificationOrderLink(orderId, event) {
  event.preventDefault();
  const popover = document.getElementById("notification-popover");
  popover.classList.add("d-none");
  isOnOrderDetails(orderId) ? await renderOrderDetailsPage(orderId) : setRoute(ROUTES.ORDER_DETAILS(orderId));
}

function createNavigationMenuItem({ href, text }) {
  return `
    <div name="module-item">
      <a class="d-flex justify-content-start align-items-center fs-5 text-decoration-none me-2 text-body cursor-pointer" href="${href}" name="${text.toLowerCase()}" onclick="sideMenuClickHandler('${text.toLowerCase()}')">${text}</a>
    </div>
  `;
}

document.addEventListener("click", (event) => {
  const notificationPopover = document.getElementById("notification-popover");
  const notificationBell = document.getElementById("notification-bell");

  if (
    notificationPopover &&
    !notificationPopover.contains(event.target) &&
    !notificationPopover.classList.contains("d-none") &&
    !notificationBell.contains(event.target)
  ) {
    notificationPopover.classList.add("d-none");
  }
});

function activateNavigationMenuItem(itemName) {
  const elements = document.querySelectorAll('[name="module-item"] a');
  elements.forEach((el) => {
    el.classList.remove("active");
    el.classList.add("text-body");
  });
  const items = document.querySelectorAll(`[name="${itemName}"]`);
  if (!items || !items.length) return;
  items.forEach((item) => {
    item.classList.add("active");
    item.classList.remove("text-body");
  });
}

const navigationMenuOptions = [
  { href: ROUTES.HOME, text: "Home" },
  { href: ROUTES.ORDERS, text: "Orders" },
  { href: ROUTES.PRODUCTS, text: "Products" },
  { href: ROUTES.CUSTOMERS, text: "Customers" },
  { href: ROUTES.MANAGERS, text: "Managers" },
];

async function handleMobileNavigationClick(event, href, itemName) {
  event.preventDefault(); // не дай браузеру перейти по <a>
  activateNavigationMenuItem(itemName);
  setRoute(href); // вручную навигация
}

function switchTheme(storedTheme) {
  let toDark;
  const themeSwitcher = document.getElementById("theme-toggle");
  if (storedTheme) {
    toDark = storedTheme === "dark";
  } else if (themeSwitcher) {
    toDark = themeSwitcher.innerHTML === themeIcons.light;
  } else {
    toDark = true;
  }
  storeTheme(toDark ? "dark" : "light");
  applyTheme(toDark);
}

function applyTheme(toDark) {
  const themeSwitcher = document.getElementById("theme-toggle");

  if (toDark) {
    if (themeSwitcher) {
      document.querySelector("#sidemenu").style["background-color"] = themeBgColors.dark;
      themeSwitcher.innerHTML = themeIcons.dark;
    }
    document.querySelector("html").style["background-color"] = themeBgColors.dark;
  } else {
    if (document.querySelector("#sidemenu")) {
      document.querySelector("#sidemenu").style["background-color"] = themeBgColors.light;
      themeSwitcher.innerHTML = themeIcons.light;
    }
    document.querySelector("html").style["background-color"] = themeBgColors.light;
  }
  document.querySelector("html").setAttribute("data-bs-theme", toDark ? "dark" : "light");
}

function getStoredTheme() {
  return window.localStorage.getItem("theme");
}

function storeTheme(theme) {
  window.localStorage.setItem("theme", theme);
}

const themeIcons = {
  light: '<i class="bi bi-moon fs-5"></i>',
  dark: '<i class="bi bi-sun fs-5"></i>',
};

const themeBgColors = {
  light: "rgb(241, 237, 237)",
  dark: "rgb(78, 78, 78)",
};

async function renderNotifications(data) {
  const badge = document.getElementById("notification-badge");

  const list = document.getElementById("notification-list");

  const readAllbutton = document.getElementById("mark-all-read");

  let notifications;
  if (data) {
    notifications = data;
  } else {
    const response = await NotificationsService.getNotifications();
    if (response.status !== STATUS_CODES.OK) {
      handleApiErrors(response);
      return;
    }
    notifications = response.data.Notifications;
    handleNotificationBadge(notifications);
  }
  const hasUnread = notifications.some((n) => !n.read);
  hasUnread ? readAllbutton.removeAttribute("disabled") : readAllbutton.setAttribute("disabled", "");

  list.innerHTML = "";
  if (notifications.length) {
    notifications.forEach((n) => {
      const li = document.createElement("li");
      li.className = "list-group-item bg-body text-body border-0 border-bottom";
      li.innerHTML = `<div style="cursor:pointer;" data-read="${
        n.read
      }" onclick="clickOnNotification(this,event)" data-notificationId="${
        n._id
      }"><small data-testId="notification-date" class="fst-italic fw-light">${formatDateToDateAndTime(
        n.createdAt
      )}</small><br><span ${n.read ? "" : "class='fw-bold'"} data-testId="notification-text">${
        n.message
      }</span><br></div><a href="#" data-testId="order-details-link" onclick="clickOnNitificationOrderLink('${
        n.orderId
      }',event)">Order Details</a>`;
      list.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.className = "list-group-item bg-dark text-light border-0 border-bottom";
    li.innerHTML = `<span class="fst-italic">No notifications</span>`;
    list.appendChild(li);
  }

  // Обновить бейдж
  const unread = notifications.filter((n) => !n.read).length;
  badge.textContent = unread;
  badge.style.display = unread ? "inline-block" : "none";
}

async function clickOnNotification(target, event) {
  event.preventDefault();
  const notificationId = target.getAttribute("data-notificationId");
  const isRead = target.getAttribute("data-read");
  if (isRead === "true") return;
  showNotificationPopoverSpinner();
  const response = await NotificationsService.readNotification(notificationId);
  if (response.status !== STATUS_CODES.OK) {
    handleApiErrors(response);
    renderNotification({ message: response.data.ErrorMessage }, true);
  } else {
    handleNotificationBadge(response.data.Notifications);
    await renderNotifications(response.data.Notifications);
  }
  hideSpinners();
}

async function markAllNotificationsAsRead(event) {
  event.preventDefault();
  showNotificationPopoverSpinner();
  const response = await NotificationsService.readAllNotifications();
  if (response.status !== STATUS_CODES.OK) {
    handleApiErrors(response);
    renderNotification({ message: response.data.ErrorMessage }, true);
  } else {
    handleNotificationBadge(response.data.Notifications);
    await renderNotifications(response.data.Notifications);
    const readAllbutton = document.getElementById("mark-all-read");
    readAllbutton.setAttribute("disabled", "");
  }
  hideSpinners();
}

function handleNotificationBadge(notifications) {
  const unread = notifications.filter((n) => !n.read).length;
  setNumberOfNotificationsToBadge(unread);
}

function setNumberOfNotificationsToBadge(unreadAmount) {
  const badge = document.getElementById("notification-badge");
  badge.textContent = unreadAmount;
  badge.style.display = unreadAmount ? "inline-block" : "none";
}

async function getNotificationsAndHangleBadge() {
  const response = await NotificationsService.getNotifications();
  if (response.status !== STATUS_CODES.OK) {
    handleApiErrors(response);
  } else {
    handleNotificationBadge(response.data.Notifications);
  }
}
