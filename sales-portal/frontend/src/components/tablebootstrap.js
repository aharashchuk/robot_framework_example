function generateTableBootstrap(data = [], options, sorting, paginationHTML = "") {
  const layout = `
    <div class="position-relative" id="table-container">
      <div class="table-responsive">
        <table class="table table-striped tableWrapper" id="${options.tableProps.id}">
          <thead>
              <tr>
                  ${generateTableHeaders(Object.keys(_.omit(data[0], "Id")), options, sorting)}
              </tr>
          </thead>
          <tbody>
              ${generateTableBody(data, options)}
          </tbody>
        </table>
      </div>
      ${paginationHTML}
    </div>
    `;
  return layout;
}

function generateTableHeaders(titles = [], options, sorting) {
  return titles.length
    ? titles
        .map((title) =>
          options.tableProps.sortableFields.includes(title)
            ? generateTableHeaderWithSorting(title, options, sorting)
            : generateTableHeader(title)
        )
        .join("") + `<th scope="col" style="text-align:center">Actions</th>`
    : options.tableProps.defaultHeaders.map((title) => `<th scope="col">${title}</th>`).join("") +
        `<th scope="col" style="text-align:center">Actions</th>`;
}

function generateTableBody(arr = [], options) {
  return arr.length
    ? arr.map((data) => `<tr>${generateTableRow(data, options)}</tr>`).join("")
    : `<tr><td colspan="${
        options.tableProps.defaultHeaders.length + 1
      }" class="fs-italic">${NO_RECORDS_IN_TABLE}</td></tr>`;
}

function generateTableRow(obj = {}, options) {
  const row = Object.keys(obj)
    .map((key) => {
      if (key !== "Id") {
        return `<td>${obj[key] || obj[key] == 0 ? obj[key] : "-"}</td>`;
      }
    })
    .join("");

  let actions = "";
  if (options && options.tableProps.buttons) {
    actions =
      "<td>" +
      options.tableProps.buttons.reduce((result, btn) => {
        if (!btn.isVisible) result += generateButton(btn, obj.Id);
        else {
          if (btn.isVisible(obj)) {
            result += generateButton(btn, obj.Id);
          }
        }
        return result;
      }, "") +
      "</td>";
  }
  return row + actions;
}

function generateTableHeader(headerName) {
  return `
  <th scope="col">
    <div class="d-flex justify-content-start align-items-center">
        <div>${headerName}</div>
    </div>
  </th>
  `;
}

function generateTableHeaderWithSorting(headerName, options, sorting) {
  const isCurrentSortingField =
    replaceApiToFeKeys[sorting.sortField] === headerName || idToOrderNumber[sorting.sortField] === headerName;
  const direction = isCurrentSortingField ? `direction="${sorting.sortOrder}"` : "";
  return `
  <th scope="col">
    <div class="d-flex justify-content-start align-items-center">
        <div style="cursor: pointer"
        onclick="${options.tableProps.sortFunction.name}(this)" 
        current="${isCurrentSortingField}"
        ${direction}>${headerName}</div>
        ${isCurrentSortingField ? generateSortButton(sorting.sortOrder) : ""}
    </div>
  </th>
  `;
}

function generateSortButton(direction) {
  let arrow = direction === "asc" ? `<i class="bi bi-arrow-down"></i>` : `<i class="bi bi-arrow-up"></i>`;

  return `<div class="text-primary ms-1">${arrow}</div>`;
}

async function sortProductsInTable(header) {
  const isCurrentSortingField = header.getAttribute("current");
  const fieldName = header.innerText;
  let direction = "asc";
  if (isCurrentSortingField === "true") {
    direction = header.getAttribute("direction") === "asc" ? "desc" : "asc";
  }
  state.sorting.products.sortField = Object.keys(replaceApiToFeKeys).find(
    (key) => replaceApiToFeKeys[key] === fieldName
  );
  state.sorting.products.sortOrder = direction;
  await getProductsAndRenderTable();
}

async function sortCustomersInTable(header) {
  const isCurrentSortingField = header.getAttribute("current");
  const fieldName = header.innerText;
  let direction = "asc";
  if (isCurrentSortingField === "true") {
    direction = header.getAttribute("direction") === "asc" ? "desc" : "asc";
  }
  state.sorting.customers.sortField = Object.keys(replaceApiToFeKeys).find(
    (key) => replaceApiToFeKeys[key] === fieldName
  );
  state.sorting.customers.sortOrder = direction;
  await getCustomersAndRenderTable();
}

async function sortOrdersInTable(header) {
  const isCurrentSortingField = header.getAttribute("current");
  const fieldName = header.innerText;
  let direction = "asc";
  if (isCurrentSortingField === "true") {
    direction = header.getAttribute("direction") === "asc" ? "desc" : "asc";
  }
  state.sorting.orders.sortField =
    Object.keys(replaceApiToFeKeys).find((key) => replaceApiToFeKeys[key] === fieldName) ??
    Object.keys(idToOrderNumber).find((key) => idToOrderNumber[key] === fieldName);
  state.sorting.orders.sortOrder = direction;
  await getOrdersAndRenderTable();
}

function renderPaginationControls(entity, total, currentPage, limit) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1 && limit === total) return "";

  let html = `<div class="d-flex justify-content-end align-items-center flex-wrap mt-3 gap-3" id="pagination-controls">`;

  // Select "Items on page"
  html += `
    <div class="d-flex align-items-center">
      <label class="me-2 mb-0 fw-semibold">Items on page:</label>
      <select class="form-select form-select-sm w-auto" onchange="onLimitChange('${entity}', this)" id="pagination-select">
        ${[10, 25, 50, 100]
          .map((val) => `<option value="${val}" ${val === limit ? "selected" : ""}>${val}</option>`)
          .join("")}
      </select>
    </div>`;

  // Страницы и стрелки
  html += `<div class="d-flex flex-wrap" id="pagination-buttons">`;

  // ← Prev
  html += `
    <button class="btn btn-sm btn-link"
      onclick="onPaginationClick('${entity}', ${currentPage - 1})"
      ${currentPage === 1 ? "disabled" : ""} title="Previous">
      <i class="bi bi-chevron-left"></i>
    </button>`;

  // Логика отображения страниц
  const buttons = [];
  const maxVisible = 9;

  buttons.push(1); // всегда первая

  if (totalPages <= maxVisible) {
    for (let i = 2; i <= totalPages; i++) buttons.push(i);
  } else {
    if (currentPage <= 5) {
      for (let i = 2; i <= 8; i++) buttons.push(i);
      buttons.push("...");
      buttons.push(totalPages);
    } else if (currentPage >= totalPages - 4) {
      buttons.push("...");
      for (let i = totalPages - 7; i <= totalPages; i++) buttons.push(i);
    } else {
      buttons.push("...");
      for (let i = currentPage - 3; i <= currentPage + 3; i++) buttons.push(i);
      buttons.push("...");
      buttons.push(totalPages);
    }
  }

  for (const p of buttons) {
    if (p === "...") {
      html += `<span class="mx-2 text-muted">...</span>`;
    } else {
      const isActive = p === currentPage;
      html += `
        <button class="btn btn-sm ${isActive ? "btn-primary" : "btn-outline-primary"} mx-1"
                onclick="onPaginationClick('${entity}', ${p})"
                ${isActive ? 'aria-current="page"' : ""}>
          ${p}
        </button>`;
    }
  }

  // → Next
  html += `
    <button class="btn btn-sm btn-link"
      onclick="onPaginationClick('${entity}', ${currentPage + 1})"
      ${currentPage === totalPages ? "disabled" : ""} title="Next">
      <i class="bi bi-chevron-right"></i>
    </button>`;

  html += `</div></div>`;
  return html;
}

async function onLimitChange(entity, selectElement) {
  const newLimit = parseInt(selectElement.value);
  state.pagination[entity].limit = newLimit;
  state.pagination[entity].page = 1;
  if (entity === "customers") await getCustomersAndRenderTable();
  else if (entity === "products") await getProductsAndRenderTable();
  else if (entity === "orders") await getOrdersAndRenderTable();

  const pagination = document.querySelector(`#pagination-controls`);
  if (pagination) {
    pagination.scrollIntoView({
      behavior: "instant",
      block: "center", // прокрутка к верхнему краю
    });
  }
}

async function onPaginationClick(entity, newPage) {
  state.pagination[entity].page = newPage;
  if (entity === "customers") await getCustomersAndRenderTable();
  else if (entity === "products") await getProductsAndRenderTable();
  else if (entity === "orders") await getOrdersAndRenderTable();

  const pagination = document.querySelector(`#pagination-controls`);
  if (pagination) {
    pagination.scrollIntoView({
      behavior: "instant",
      block: "center", // прокрутка к верхнему краю
    });
  }
}
