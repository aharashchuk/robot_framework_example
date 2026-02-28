router();
if (!getStoredTheme) {
  storeTheme("light");
}
switchTheme(getStoredTheme());

async function router() {
  const token = getAuthorizationCookie();

  const hash = window.location.hash || "#/";
  const path = hash.slice(2); // убираем '#/'

  if (!document.querySelector("body div")) {
    if (token) {
      renderPages["Landing"](landingProps);
    } else {
      renderPages["Sign In"]();
      setRoute(ROUTES.SIGNIN);
    }
    return;
  }

  // Home
  if (path === "" || path === "/") {
    setRoute(ROUTES.HOME);
  } else if (path === "home") {
    if (!document.querySelector("#sidebar") && !document.querySelector("#emailinput")) {
      if (token) {
        renderPages["Landing"](landingProps);
        activateNavigationMenuItem("home");
      } else renderPages["Sign In"]();
      return;
    }
    activateNavigationMenuItem("home");
    await renderHomePage(homeProps);
  }

  // Sign In
  else if (path === "login") {
    activateNavigationMenuItem("home");
    token ? setRoute(ROUTES.HOME) : renderPages["Sign In"]();
  }

  // Customers
  else if (path === "customers") {
    activateNavigationMenuItem("customers");
    await renderPages.Customers();
  } else if (path === "customers/add") {
    activateNavigationMenuItem("customers");
    await renderAddNewCustomerPage();
  } else if (/^customers\/[\w-]+\/edit$/.test(path)) {
    const id = path.split("/")[1];
    activateNavigationMenuItem("customers");
    await renderEditCustomerPage(id);
  } else if (/^customers\/[\w-]+$/.test(path)) {
    const id = path.split("/")[1];
    activateNavigationMenuItem("customers");
    await renderCustomerDetailsPage(id);
  }

  // Products
  else if (path === "products") {
    activateNavigationMenuItem("products");
    await renderPages.Products();
  } else if (path === "products/add") {
    activateNavigationMenuItem("products");
    await renderAddNewProductPage();
  } else if (/^products\/[\w-]+\/edit$/.test(path)) {
    const id = path.split("/")[1];
    activateNavigationMenuItem("products");
    await renderEditProductPage(id);
  }

  // Orders
  else if (path === "orders") {
    activateNavigationMenuItem("orders");
    await renderOrdersPage();
  } else if (/^orders\/[\w-]+\/edit-delivery$/.test(path)) {
    const id = path.split("/")[1];
    activateNavigationMenuItem("orders");
    await renderEditDeliveryPage(id);
  } else if (/^orders\/[\w-]+\/schedule-delivery$/.test(path)) {
    const id = path.split("/")[1];
    activateNavigationMenuItem("orders");
    await renderScheduleDeliveryPage(id);
  } else if (/^orders\/[\w-]+$/.test(path)) {
    const id = path.split("/")[1];
    activateNavigationMenuItem("orders");
    await renderOrderDetailsPage(id);
  }

  // Managers
  else if (path === "managers") {
    activateNavigationMenuItem("managers");
    await renderPages.Managers();
  } else if (path === "managers/add") {
    activateNavigationMenuItem("managers");
    await renderAddManagerPage();
  } else if (/^managers\/[\w-]+\/edit$/.test(path)) {
    const id = path.split("/")[1];
    activateNavigationMenuItem("managers");
    await renderEditManagerPage(id); // если реализовано
  } else if (/^managers\/[\w-]+$/.test(path)) {
    const id = path.split("/")[1];
    activateNavigationMenuItem("managers");
    await renderManagerDetailsPage(id);
  } else if (path === "login") {
    activateNavigationMenuItem("managers");
    await renderSignInPage();
  }

  // 404 fallback
  else {
    activateNavigationMenuItem();
    renderNotFoundPage();
  }
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);

async function sideMenuClickHandler(page) {
  switch (page) {
    // case "Home":
    //   renderPages[page](homeProps);
    //   break;

    case "products":
      {
        if (window.location.hash.endsWith("/products")) {
          activateNavigationMenuItem("products");
          await getProductsAndRenderTable();
        }
      }
      break;

    case "customers":
      {
        if (window.location.hash.endsWith("/customers")) {
          activateNavigationMenuItem("customers");
          await getCustomersAndRenderTable();
        }
      }
      break;

    case "orders":
      {
        if (window.location.hash.endsWith("/orders")) {
          activateNavigationMenuItem("orders");
          await getOrdersAndRenderTable();
        }
      }
      break;

    // case "Managers": {
    //   renderPages[page](ManagersProps);
    //   break;
    // }
  }
}
