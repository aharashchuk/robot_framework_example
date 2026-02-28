const layout = `
<div class="overlay">
  <div class="d-flex justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</div>

<section class="vh-100">
<div class="container-fluid h-custom">
  <div class="row d-flex justify-content-center align-items-center h-100">
    <div class="col-md-9 col-lg-6 col-xl-5">
      <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
        class="img-fluid" alt="Sample image">
    </div>
    <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
      <form>
        <div class="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
          <p class="lead fw-normal mb-0 me-3">Sign in with</p>
          <button type="button" class="btn btn-link btn-floating mx-1">
            <i class="bi bi-facebook"></i>
          </button>

          <button type="button" class="btn btn-link btn-floating mx-1">
            <i class="bi bi-twitter"></i>
          </button>

          <button type="button" class="btn btn-link btn-floating mx-1">
           <i class="bi bi-linkedin"></i>
          </button>
        </div>

        <div class="divider d-flex align-items-center my-4">
          <p class="text-center fw-bold mx-3 mb-0">Or</p>
        </div>

        <!-- Email input -->
        <div class="form-outline mb-4">
          <input type="email" id="emailinput" class="form-control form-control-lg"
            placeholder="Enter a valid email address" autocomplete="off" />
          <label class="form-label" for="emailinput">Email address</label>
        </div>

        <!-- Password input -->
        <div class="form-outline mb-3">
          <input type="password" id="passwordinput" class="form-control form-control-lg"
            placeholder="Enter password" autocomplete="off" />
          <label class="form-label" for="passwordinput">Password</label>
          <h4 id="errorMessage">Credentials are required</h4>
        </div>

        <div class="d-flex justify-content-between align-items-center">
          <!-- Checkbox -->
          <div class="form-check mb-0">
            <input class="form-check-input me-2" type="checkbox" value="" id="remembermecheckbox" />
            <label class="form-check-label" for="remembermecheckbox">
              Remember me
            </label>
          </div>
          <!-- <a href="#!" class="text-body">Forgot password?</a> -->
        </div>

        <div class="text-center text-lg-start mt-4 pt-2">
          <button type="submit" class="btn btn-primary btn-lg loginBtn">Login</button>
            <!-- <p class="small fw-bold mt-2 pt-1 mb-0">Don't have an account? <a href="#!"
              class="link-danger">Register</a></p> -->
        </div>

      </form>
    </div>
  </div>
</div>
<div
  class="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-body">
  <!-- Copyright -->
  <div class="text-body mb-3 mb-md-0">
    Copyright © ${moment().year()}. All rights reserved.
  </div>
  <!-- Copyright -->

  <!-- Right -->
  <div>
    <a href="https://www.linkedin.com/in/anatolykarpovich/" class="text-body">
      <i class="fab fa-linkedin-in"></i>
    </a>
  </div>
  <!-- Right -->
</div>
</section>`;

function renderSignInPage() {
  disconnectSocket();
  if (document.getElementById("signInPage")) return;
  if (document.querySelector("#sidemenu")) {
    document.querySelector("#sidemenu").parentNode.removeChild(document.querySelector("#sidemenu"));
  }
  const signIn = document.createElement("div");
  signIn.id = "signInPage";
  signIn.insertAdjacentHTML("afterbegin", layout);
  document.body.prepend(signIn);

  const email = signIn.querySelector("#emailinput");
  const password = signIn.querySelector("#passwordinput");

  const submit = signIn.querySelector(`.btn-lg`);
  submit.addEventListener("click", async (e) => {
    e.preventDefault();
    const credentials = { username: email.value, password: password.value };
    setSpinnerToButton(submit);
    const response = await SignInService.signIn(credentials);
    if (response.status === STATUS_CODES.OK) {
      document.cookie = `Authorization=${response.headers.authorization}`;
      window.localStorage.setItem("user", JSON.stringify(response.data.User));
      state.user = response.data.User;
      signIn.classList.add("disabled");
      signIn.parentNode.removeChild(signIn);
      // await renderLandingPage(landingProps);
      setRoute(ROUTES.HOME);
    } else {
      removeSpinnerFromButton(submit, { innerText: "Login" });
      renderNotification(
        { message: response.data.ErrorMessage ? response.data.ErrorMessage : ERROR_MESSAGES["Connection Issue"] },
        true
      );
    }
    // hideSpinner();
  });
}
