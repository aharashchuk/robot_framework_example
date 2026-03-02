let socket = null;

function connectSocket() {
  if (socket) {
    socket.disconnect();
  }
  socket = io(BASE_URL, {
    auth: { token: getAuthorizationCookie() },
  });

  socket.on("connect", function () {
    console.log("Socket connected!");
  });

  socket.on("connect_error", function (err) {
    console.error("Socket connect_error:", err.message, err);
  });

  socket.on("disconnect", function () {
    console.log("Socket disconnected!");
  });

  socket.on("new_notification", function (payload) {
    console.log("Emited event:", payload);
    setNumberOfNotificationsToBadge(payload.unreadAmount);
  });
}

function disconnectSocket() {
  socket && socket.disconnect();
  socket = null;
}
