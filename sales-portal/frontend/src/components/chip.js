function createChipButton(text, page, isFilter) {
  const id = isFilter ? text : "search";
  return `
    <div class="chip text-primary border" data-chip-${page}="${id}">${text}<i 
    class="closebtn bi-x-lg" data-chip-${page}="${id}" onClick="removeChipButtonAndRenderTable('${id}', '${page}', '${
    isFilter ? 1 : 0
  }')"></i></div>
    `;
}

async function removeChipButtonAndRenderTable(id, page, isFilter) {
  removeChipButton(id, page, isFilter);
  await getDataAndRenderTable(page);
}

function removeChipButton(id, page, isFilter) {
  const chipButton = document.querySelector(`[data-chip-${page}="${id}"]`);
  chipButton.parentNode.removeChild(chipButton);
  if (+isFilter) {
    state.filtering[page][id] = false;
  } else {
    state.search[page] = "";
  }
}

function renderChipButton(text, page, isFilter) {
  document.querySelector(`div#chip-buttons`).innerHTML += createChipButton(text, page, isFilter);
}

function renderChipsFromState(page) {
  const searchValue = state.search[page];
  if (searchValue) renderChipButton(searchValue, page);

  const filters = Object.keys(state.filtering[page]).filter((key) => state.filtering[page][key]);
  filters.forEach((f) => renderChipButton(f, page, true));
}
