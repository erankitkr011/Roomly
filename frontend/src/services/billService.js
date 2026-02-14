import axiosInstance from "../utils/axiosInstance";

const billService = {
  sendBill: (data) => axiosInstance.post("/landlord/send-bill", data),
  updateBill: (billId, data) => axiosInstance.put(`/landlord/update-bill/${billId}`, data),
  requestDeleteBill: (billId, reason) => axiosInstance.post(`/landlord/request-delete-bill/${billId}`, { reason }),
  payCashBill: (billId) => axiosInstance.post(`/landlord/pay-cash-bill/${billId}`),
};

export default billService;
