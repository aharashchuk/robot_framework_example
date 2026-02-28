let filtersModalWrap = null;
const filters = {};
for (const f in FILTER_VALUES) {
  filters[f] = FILTER_VALUES[f].reduce((acc, value) => {
    acc[value] = false;
    return acc;
  }, {});
}

function renderFiltersModal(page) {
  filters[page] = _.cloneDeep(state.filtering[page]);
  if (filtersModalWrap !== null) {
    filtersModalWrap.remove();
  }
  filtersModalWrap = document.createElement("div");
  filtersModalWrap.setAttribute("modal", "");
  filtersModalWrap.insertAdjacentHTML(
    "afterbegin",
    `
        <div class="modal" tabindex="-1">
          <div class="modal-dialog modal-filters-wrapper">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="bi bi-filter me-2"></i>
                  Filters
                </h5>
                <button type="button" class="btn-close hover-danger" data-bs-dismiss="modal" aria-label="Close" onClick="removeFiltersModal()"></button>
              </div>
                <div class="modal-body modal-body-text modal-filters-body">
                    ${createFilterCheckboxes(page)}
                </div>
              <div class="modal-footer">
                <div class="modal-footer-mr">
                  <button type="submit" class="btn btn-primary mr-10" id="apply-filters">Apply</button>
                  <button class="btn btn-secondary" id="clear-filters">Clear Filters</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        `
  );

  document.body.prepend(filtersModalWrap);

  const $filtersModalWrap = new bootstrap.Modal(filtersModalWrap.querySelector(".modal"));
  $filtersModalWrap.show();
  $("#apply-filters").on("click", async (e) => {
    e.preventDefault();
    await submitFilters(page);
  });
  $("button#clear-filters").on("click", async (event) => {
    event.preventDefault();
    await clearAllFilters(page);
  });
}

async function submitFilters(page) {
  const changedFiltersToTrue = {};
  const changedFiltersToFalse = {};
  for (key in filters[page]) {
    if (filters[page][key] !== state.filtering[page][key]) {
      filters[page][key]
        ? (changedFiltersToTrue[key] = filters[page][key])
        : (changedFiltersToFalse[key] = filters[page][key]);
    }
  }
  Object.keys(changedFiltersToTrue).forEach((key) => renderChipButton(key, page, true));
  Object.keys(changedFiltersToFalse).forEach((key) => removeChipButton(key, page, true));
  state.filtering[page] = _.cloneDeep(filters[page]);
  removeFiltersModal();
  await getDataAndRenderTable(page);
}

async function clearAllFilters(page) {
  for (const key of Object.keys(state.filtering[page])) {
    filters[page][key] = false;
  }
  [...document.querySelectorAll("[id*=-filter]")].forEach((el) => el.removeAttribute("checked"));
  submitFilters(page);
  const chips = document.querySelectorAll(`div#chip-buttons [data-chip-${page}]`);
  if (chips.length) {
    chips.forEach((el) => {
      const id = el.getAttribute(`data-chip-${page}`);
      if (id !== "search") removeChipButton(id, page, true);
    });
  }
}

function applyFilter(page, name) {
  filters[page][name] = !filters[page][name];
  const checkbox = $(`input#${name}-filter`);
  checkbox.prop("checked", filters[page][name]);
}

function createFilterCheckboxes(page) {
  return FILTER_VALUES[page].map((name) => createFilterCheckbox(page, name)).join("");
}
function createFilterCheckbox(page, name) {
  return `
        <div class="form-check mb-0 d-width">
            <input class="form-check-input me-2 ml-5" type="checkbox" ${state.filtering[page][name] ? "checked" : ""} 
            value="${name}" id="${name}-filter" onClick="applyFilter('${page}', '${name}')">
            <label class="form-check-label" for="${name}-filter">
                ${name}
            </label>
        </div>`;
}

function removeFiltersModal() {
  document.querySelector("[modal]").parentNode.removeChild(document.querySelector("[modal]"));
  filtersModalWrap = null;
  $("body").removeClass("modal-open");
  $("body").removeAttr("style");
  if (document.querySelector(".modal-backdrop")) {
    document.querySelector(".modal-backdrop").parentNode.removeChild(document.querySelector(".modal-backdrop"));
  }
}
