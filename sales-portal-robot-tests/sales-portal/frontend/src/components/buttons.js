function generateButton(options, id) {
  if (options.href) return generateLinkButton(options, id);
  return `
    <button 
    ${options?.type ? "type=" + '"' + options.type + '" ' : ""}
    ${options?.id ? "id=" + '"' + options.id + '" ' : ""}
    ${options?.classlist ? "class=" + '"' + options.classlist + '" ' : ""}
    ${options?.title ? "title=" + '"' + options.title + '" ' : ""}
    ${options?.attributes ? options?.attributes.join(" ") : ""}
    ${options?.onclick ? "onclick=" + '"' + options.onclick + "(" + (id ? "'" + id + "'" : "") + ")" + '" ' : ""}
    ${options?.disabled ? "disabled " : ""}
    >${options?.name ? options.name : ""}
    ${options?.nestedItems ? options.nestedItems : ""}
    </button>
    `;
}

function generateLinkButton(options, id) {
  return `
    <a 
    ${options?.type ? "type=" + '"' + options.type + '" ' : ""}
    ${
      options?.href ? "href=" + '"' + (typeof options.href === "function" ? options.href(id) : options.href) + '" ' : ""
    }
    ${options?.id ? "id=" + '"' + options.id + '" ' : ""}
    ${options?.classlist ? "class=" + '"' + options.classlist + '" ' : ""}
    ${options?.title ? "title=" + '"' + options.title + '" ' : ""}
    ${options?.attributes ? options?.attributes.join(" ") : ""}
    ${options?.onclick ? "onclick=" + '"' + options.onclick + "(" + (id ? "'" + id + "'" : "") + ")" + '" ' : ""}
    ${options?.disabled ? "disabled " : ""}
    >${options?.name ? options.name : ""}
    ${options?.nestedItems ? options.nestedItems : ""}
    </a>
    `;
}

function saveButton(id, name, classes) {
  return `
  <button type="submit" id="${id}" class="btn btn-primary form-buttons ${
    classes ? classes : ""
  }" disabled="">${name}</button>
  `;
}

function backButton(id, name, classes) {
  return `
  <button id="${id}" class="btn btn-secondary form-buttons ${classes ? classes : ""}">${name}</button>
  `;
}

function clearInputsButton(id, name) {
  return `
  <button id="${id}" class="btn btn-link clear-btn form-buttons">${name}</button>
  `;
}

function deleteButton(id, name) {
  return `
  <button id="${id}" class="btn btn-danger">${name}</button>
  `;
}

function searchBar(buttons) {
  return `

    <div class="d-flex flex-wrap align-items-center gap-2">
        <form class="d-flex search-bar">
          <input class="form-control me-2" id="search" type="search" placeholder="Type a value..." maxlength="40" aria-label="Search" oninput="seachButtonHandler(this)">
          ${generateButton(buttons.search)}
        </form>
        <button class="btn btn-outline-primary ms-2 d-flex justify-content-start" id="filter" ${
          state.page === PAGES.MANAGERS ? "disabled" : ""
        }>
            <i class="bi bi-funnel me-2"></i> Filter
        </button>
        <button id="export" class="btn btn-primary ms-2 page-title-button" onclick="createExportModal()">Export</button>       
    </div>
`;
}

function chipsSection() {
  return `<div id="chip-buttons" class="ml-50"></div>`;
}

function generatePageTitle(options, entitiName) {
  return `
  <h2 class="${options.classlist ? options.classlist : "page-title-text"}">${options.title} ${
    entitiName ? entitiName : ""
  }</h2>
  `;
}

function generateFormSelectInput(options, data) {
  return `
    <div class="${options.divClasslist}" id="div-${options.id}">
      <label for="${options.id}" class="form-label">${options.name}</label>
      <select id="${options.id}" class="${options.classlist}"
      ${options.attributes ? options.attributes : ""}>
      ${
        data
          ? renderCustomersOptions(options, data)
          : renderOptions(options.options.values, options.defaultValue, options.value, options.options.titles)
      }
      </select>
    </div>`;
}

function generateFormSelectInputWithoutLabel(options) {
  return `
    <div class="${options.divClasslist}">
      <select id="${options.id}" class="${options.classlist}"
      ${options.attributes ? options.attributes : ""}>
      ${renderOptions(options.options.values, options.defaultValue, options.value)}
      </select>
    </div>`;
}

function generateFormTextInput(options) {
  return ` <div class="${options.divClasslist}" id="div-${options.id}">
                <label for="${options.id}" class="form-label">${options.name}</label>
                <input type="${options.type}" class="${options.classlist}" id="${options.id}" 
                placeholder="${options.placeholder}" ${options.attributes ? options.attributes : ""}
                value="${options.value}"> 
                <div class="invalid-feedback" id=error-${options.id}></div>
                </div>`;
}

function generateTextareaInput(options) {
  return `<div class="${options.divClasslist}">
                <label for="${options.id}" class="form-label">${options.name}</label>
                <textarea class="${options.classList}" id="${options.id}" ${options.attributes} 
                placeholder="${options.placeholder}" 
                ${options.attributes ? options.attributes : ""}>${options.value}</textarea>
                <div class="invalid-feedback" id=error-${options.id}></div>
              </div>`;
}

function generateTextareaInputWithoutLabel(options) {
  return `<div class="${options.divClasslist}">
                <textarea class="${options.classList}" id="${options.id}" ${options.attributes} 
                placeholder="${options.placeholder}" 
                ${options.attributes ? options.attributes : ""}>${options.value}</textarea>
                <div class="invalid-feedback" id=error-${options.id}></div>
              </div>`;
}

function generateEditPencilButton(options) {
  return `
  <button 
  class="btn edit-pencil"
  ${options?.id ? "id=" + '"' + options.id + '" ' : ""}
  ${options?.title ? "title=" + '"' + options.title + '" ' : ""}>
  <i class="bi bi-pencil-fill"></i>
  </button>`;
}

function backLink(href, text) {
  return `<a href="${href}" class="back-link"><i class="bi bi-arrow-left me-2"></i> ${text}</a>`;
}

function createOptions(selectSelector, arrayOfOptions) {
  $(selectSelector).html(
    arrayOfOptions.map((el, i) => `<option value="${el}" ${!i ? "selected" : ""}>${el}</option>`).join("")
  );
}
