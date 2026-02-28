class MetricsService {
  static async get() {
    const options = {
      method: "get",
      baseURL: BASE_URL,
      url: ENDPOINTS.Metrics,
      headers: {
        Authorization: getAuthorizationCookie(),
        ["Content-Type"]: "application/json",
      },
    };
    return sendRequest(options);
  }
}
