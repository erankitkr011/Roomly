import axiosInstance from "../utils/axiosInstance";

const notificationService = {
  getAll: () => axiosInstance.get("/notifications"),
  markAsRead: (id) => axiosInstance.put(`/notifications/${id}/read`),
  sendToRenters: (data) => axiosInstance.post("/landlord/send-notification", data),
  acceptRoomRequest: (notificationId) => axiosInstance.post("/renter/accept-room-request", { notificationId }),
  rejectRoomRequest: (notificationId, reason) => axiosInstance.post("/renter/reject-room-request", { notificationId, reason }),
};

export default notificationService;
