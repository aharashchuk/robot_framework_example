let notificationContainer = null;

function renderNotificationContainer() {
  if (document.querySelector(".notification-wrapper")) return;
  notificationContainer = document.createElement("div");
  notificationContainer.classList.add("toast-container");
  notificationContainer.classList.add("notification-wrapper");
  notificationContainer.style["margin-top"] = "20px";
  document.body.prepend(notificationContainer);
  notificationContainer.addEventListener("click", (event) => {
    event.preventDefault();
    if (event.target.title === "Close") {
      const currentId = event.target.id;
      const n = document.querySelector(`div[id="${currentId}"]`);
      delete state.notifications[currentId];
      notificationContainer.removeChild(n);
    }
  });
}

function renderNotification(options, isError) {
  const notification = document.createElement("div");
  const id = window.crypto.randomUUID();
  notification.id = id;
  notification.insertAdjacentHTML("afterbegin", `${generateNofificationLayout(options, id, isError)}`);
  if (!notificationContainer) {
    renderNotificationContainer();
  }
  const container = document.querySelector(".toast-container");
  container.append(notification);
  state.notifications[id] = true;

  setTimeout(() => {
    if (state.notifications[id]) {
      const n = document.querySelector(`div[id="${id}"]`);
      container.removeChild(n);
      delete state.notifications[id];
    }
  }, 10000);
}

function generateNofificationLayout(options, id, isError) {
  const classes = isError ? "bg-danger text-white" : "";
  return `<div class="toast align-items-center show ${classes}" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false" id="toast">
        <div class="d-flex">
            <div class="toast-body">
                ${options.message}
            </div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" title='Close' id=${id}></button>
        </div>
    </div>`;
}
