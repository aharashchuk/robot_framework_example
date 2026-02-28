function renderErrorPageLayout(status) {
  return `
    <div class="d-flex align-items-center justify-content-center vh-100">
        <div class="text-center">
            <h1 class="display-5 fw-bold">${status || "Connection failed"}</h1>
            <p class="fs-3"> <span class="text-danger">Opps!</span> Something went wrong.</p>
            <p class="lead">
                Can't reach the data. Please, try again later.
                </p>
            <a href="${ROUTES.HOME}" class="btn btn-primary mt-3">Back to Home</a>
        </div>
    </div>
    `;
}
