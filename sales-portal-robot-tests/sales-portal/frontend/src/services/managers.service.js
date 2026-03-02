class ManagersService {
  static async getManagers(id) {
    const options = {
      method: "get",
      baseURL: BASE_URL,
      url: id ? ENDPOINTS["Get Manager By Id"](id) : ENDPOINTS.Managers,
      headers: {
        Authorization: getAuthorizationCookie(),
        ["Content-Type"]: "application/json",
      },
    };
    return sendRequest(options);
  }

  static async getSorted(params) {
    const options = {
      method: "get",
      baseURL: BASE_URL,
      url: ENDPOINTS.Managers + generateUrlParams(params),
      headers: {
        Authorization: getAuthorizationCookie(),
        ["Content-Type"]: "application/json",
      },
    };
    return sendRequest(options);
  }

  static async createManager(manager) {
    const options = {
      method: "post",
      baseURL: BASE_URL,
      url: ENDPOINTS.Managers,
      headers: {
        Authorization: getAuthorizationCookie(),
        ["Content-Type"]: "application/json",
      },
      data: manager,
    };
    return sendRequest(options);
  }

  static async editManager(manager) {
    const options = {
      method: "put",
      baseURL: BASE_URL,
      url: ENDPOINTS["Get Manager By Id"](manager._id),
      headers: {
        Authorization: getAuthorizationCookie(),
        ["Content-Type"]: "application/json",
      },
      data: _.omit(manager, ["_id"]),
    };
    return sendRequest(options);
  }

  static async deleteManager(id) {
    const options = {
      method: "delete",
      baseURL: BASE_URL,
      url: ENDPOINTS["Get Manager By Id"](id),
      headers: {
        Authorization: getAuthorizationCookie(),
        ["Content-Type"]: "application/json",
      },
    };
    return sendRequest(options);
  }

  static async changePassword(id, passwords) {
    const options = {
      method: "patch",
      baseURL: BASE_URL,
      url: ENDPOINTS["Change Manager Password"](id),
      headers: {
        Authorization: getAuthorizationCookie(),
        ["Content-Type"]: "application/json",
      },
      data: passwords,
    };
    return sendRequest(options);
  }
}
