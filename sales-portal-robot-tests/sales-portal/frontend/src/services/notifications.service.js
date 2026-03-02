class NotificationsService {
  static async getNotifications() {
    const options = {
      method: "get",
      baseURL: BASE_URL,
      url: ENDPOINTS["Notifications"],
      headers: {
        Authorization: getAuthorizationCookie(),
        ["Content-Type"]: "application/json",
      },
    };
    return sendRequest(options);
  }

  static async readAllNotifications() {
    const options = {
      method: "patch",
      baseURL: BASE_URL,
      url: ENDPOINTS["Notification read all"],
      headers: {
        Authorization: getAuthorizationCookie(),
        ["Content-Type"]: "application/json",
      },
    };
    return sendRequest(options);
  }

  static async readNotification(notificationId) {
    const options = {
      method: "patch",
      baseURL: BASE_URL,
      url: ENDPOINTS["Notification by Id"](notificationId),
      headers: {
        Authorization: getAuthorizationCookie(),
        ["Content-Type"]: "application/json",
      },
    };
    return sendRequest(options);
  }
}
