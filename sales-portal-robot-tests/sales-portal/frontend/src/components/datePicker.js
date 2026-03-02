function generateDatePicker() {
  return `
            <div class="form-group">
                <label for="date" class="form-label">Date</label>
                <div id="date">
                    <div class="input-group date" id="datepicker">
                        <input type="text" class="form-control d-p-input" id="date-input" readonly>
                        <span class="input-group-append">
                            <span class="input-group-text text-primary d-p-icon">
                                <i class="bi bi-calendar3"></i>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
    `;
}

function enableDatePicker(params) {
  const options = {
    format: DATE_FORMAT.toLowerCase(),
    startDate: "+3d",
    endDate: "+10d",
    autoclose: true,
    ...params,
  };
  $("#datepicker").datepicker(options);
}

function setUpDateToDatePicker(date) {
  $("#datepicker").data({ date });
  $("#datepicker").datepicker("update");
  $("#datepicker").datepicker().children("input").val(date);
}
